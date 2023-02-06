import { Message } from 'discord.js';
import { DiceCommand } from './commands/aplication/diceCommand';
import { ReplyCommand } from './commands/aplication/replyCommand';
import { UsersUsingACommand } from './commands/aplication/utils/usersUsingACommand';
import { CommandHandler } from './commands/commandHandler';
import { Server } from './commands/domain/interfaces/server';
import { Routes } from './commands/routes';
import { DatabaseConnection } from './database/databaseConnection';
import { DiscordServer } from './database/server/domain/discordServerEntity';

export class ServerRouting {
    private serverList: Server[] = [];
    private databaseConnection: DatabaseConnection;

    constructor(databaseConnection: DatabaseConnection) {
        this.databaseConnection = databaseConnection;
    }

    public async createServerList() {
        // take servers from db and put in memory
        const discordServerList = await this.databaseConnection.server.getAll();
        if (discordServerList) {
            this.serverList = discordServerList.map((discordServer: DiscordServer) =>
                this.mapServerData(discordServer),
            );
        }
    }

    private mapServerData(discordServer: DiscordServer): Server {
        let blackList: string[] = [];
        if (discordServer.blackList) {
            blackList = discordServer.blackList.split(',');
        }

        const server: Server = {
            id: discordServer.id,
            prefix: discordServer.prefix,
            adminRole: discordServer.adminRole,
            blackList,
            instance: this.newCommandHandlerInstance(),
        };

        return server;
    }

    private newCommandHandlerInstance() {
        const diceCommand = new DiceCommand();
        const replyCommand = new ReplyCommand();
        const usersUsingACommand = new UsersUsingACommand();
        const routes = new Routes(usersUsingACommand);

        return new CommandHandler(diceCommand, replyCommand, routes, usersUsingACommand);
    }

    public async call(event: Message): Promise<void> {
        if (!event.guild) {
            return;
        }
        // look if the server is alredy instanced, if it is, call it
        const eventServer = this.serverList.find((server) => server.id === event.guild!.id);

        if (eventServer) {
            return eventServer.instance.isCommand(event);
        }

        // else create post nedw server to db and put it in memory
        await this.addSeverToServerList(event);
    }

    private async addSeverToServerList(event: Message): Promise<void> {
        const newDiscordServer = await this.databaseConnection.server.create(
            event.guild!.id,
            event.guild!.name,
        );
        const server = this.mapServerData(newDiscordServer);
        this.serverList.push(server);

        return this.call(event);
    }
}
