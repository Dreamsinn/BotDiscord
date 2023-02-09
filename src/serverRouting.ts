import { Message } from 'discord.js';
import { DiceCommand } from './commands/aplication/diceCommand';
import { ReplyCommand } from './commands/aplication/replyCommand';
import { UsersUsingACommand } from './commands/aplication/utils/usersUsingACommand';
import { CommandHandler } from './commands/commandHandler';
import { CommandSchema } from './commands/domain/interfaces/commandSchema';
import { SchemaDictionary } from './commands/domain/interfaces/schemaDictionary';
import { Server } from './commands/domain/interfaces/server';
import { Routes } from './commands/routes';
import { Schema } from './database/commandsSchema/domain/schemaEntity';
import { ConnectionHandler } from './database/connectionHandler';
import { DiscordServer } from './database/server/domain/discordServerEntity';

export class ServerRouting {
    private serverList: Server[] = [];
    private databaseConnection: ConnectionHandler;
    private commandSchemaList: CommandSchema[];

    constructor(databaseConnection: ConnectionHandler, commandSchemaList: CommandSchema[]) {
        this.databaseConnection = databaseConnection;
        this.commandSchemaList = commandSchemaList;
    }

    public async createServerList() {
        // take servers from db and put in memory
        const discordServerList = await this.databaseConnection.server.getAll();
        if (discordServerList.length) {
            for (const discordServer of discordServerList) {
                const server = await this.mapServerData(discordServer);
                this.serverList.push(server);
            }
        }
    }

    private async mapServerData(discordServer: DiscordServer): Promise<Server> {
        const blackList: string[] = discordServer.blackList ? discordServer.blackList.split(',') : [];

        const server: Server = {
            id: discordServer.id,
            prefix: discordServer.prefix,
            adminRole: discordServer.adminRole,
            blackList,
            instance: await this.newCommandHandlerInstance(discordServer.id, discordServer.prefix),
        };

        return server;
    }

    private async newCommandHandlerInstance(serverId: string, prefix: string) {
        const schemaDictionary = await this.getSchemas(this.commandSchemaList, serverId);

        const diceCommand = new DiceCommand(schemaDictionary['Dice Command']);
        const replyCommand = new ReplyCommand(schemaDictionary['Reply Command']);
        const usersUsingACommand = new UsersUsingACommand();
        const routes = new Routes(usersUsingACommand, schemaDictionary, prefix, this.databaseConnection);

        return new CommandHandler(diceCommand, replyCommand, routes, usersUsingACommand, prefix);
    }

    private async getSchemas(
        commandSchemaList: CommandSchema[],
        serverId: string,
    ): Promise<SchemaDictionary> {
        // serach all schemas in db by serverId and return
        const schemaList: Schema[] = await this.databaseConnection.schema.getAllByGuildId(serverId);

        if (!schemaList.length) {
            // if none create them and return SchemaDictionary object
            await this.databaseConnection.schema.create(commandSchemaList, serverId);
            return this.mapSchemaDictionary(commandSchemaList);
        }

        if (schemaList.length !== commandSchemaList.length) {
            // if some lacking create them
            const lackingSchemas = this.findLackingSchemas(schemaList, commandSchemaList);
            const newSchemas = await this.databaseConnection.schema.create(lackingSchemas, serverId);
            schemaList.push(...newSchemas);
        }

        // return SchemaDictionary object
        return this.convertSchemaToCommandSchema(schemaList);
    }

    private mapSchemaDictionary(schemasList: CommandSchema[]): SchemaDictionary {
        const schemaDictionary: any = {};
        schemasList.map((commandSchema: CommandSchema) => {
            schemaDictionary[commandSchema.command] = commandSchema;
        });

        return schemaDictionary;
    }

    private findLackingSchemas(
        schemaList: Schema[],
        commandSchemaList: CommandSchema[],
    ): CommandSchema[] {
        const lackingSchema = commandSchemaList.filter((commandSchema: CommandSchema) => {
            return !schemaList.some((schema: Schema) => {
                return commandSchema.command === schema.command;
            });
        });

        return lackingSchema;
    }

    private convertSchemaToCommandSchema(schemaList: Schema[]): SchemaDictionary {
        const commandSchemaList: CommandSchema[] = schemaList.map((schema: Schema) => {
            const commandSchema: CommandSchema = {
                name: schema.name,
                aliases: schema.aliases.split(','),
                coolDown: schema.coolDown,
                adminOnly: schema.adminOnly,
                description: schema.description,
                command: schema.command,
                category: schema.category,
            };
            return commandSchema;
        });
        return this.mapSchemaDictionary(commandSchemaList);
    }

    public async updateServer(event: Message) {
        // when server config is changed, set it
        const serverIdPosition = event.content.indexOf(':');
        const serverId = event.content.substring(serverIdPosition + 2);

        const serverToUpdate = this.serverList.find((server: Server) => server.id === serverId);

        const newServerData = await this.databaseConnection.server.getById(serverId);
        if (serverToUpdate && newServerData) {
            serverToUpdate.prefix = newServerData.prefix;
            serverToUpdate.instance.resetPrefix(newServerData.prefix);
            serverToUpdate.adminRole = newServerData.adminRole;
            serverToUpdate.blackList = newServerData.blackList ? newServerData.blackList.split(',') : [];

            console.log(this.serverList.find((server: Server) => server.id === serverId));
            await event.channel.send('Configuración actualizada');
            return;
        }
    }

    public async call(event: Message): Promise<void> {
        // event handler
        if (!event.guild) {
            return;
        }
        // look if the server is alredy instanced, if it is, call it
        const eventServer = this.serverList.find((server) => server.id === event.guild!.id);

        if (eventServer) {
            if (
                eventServer.blackList.length &&
                eventServer.blackList.includes(String(event.author.id))
            ) {
                return;
            }
            return eventServer.instance.isCommand(event);
        }

        // else create new server in db and put it in memory
        await this.addSeverToServerList(event);
    }

    private async addSeverToServerList(event: Message): Promise<void> {
        const newDiscordServer = await this.databaseConnection.server.create(
            event.guild!.id,
            event.guild!.name,
        );
        const server = await this.mapServerData(newDiscordServer);
        this.serverList.push(server);

        return this.call(event);
    }
}
