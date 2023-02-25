import { Message } from 'discord.js';
import { DiceCommand } from './aplication/diceCommand';
import { ConfigSchemaCommand } from './aplication/prefixCommands/configSchemaCommand/configSchemaCommand';
import { DiceCommandToggler } from './aplication/prefixCommands/diceCommandToggler';
import { HelpCommand } from './aplication/prefixCommands/helpCommand';
import { ReplyCommandToggler } from './aplication/prefixCommands/replyCommandToggler';
import { ReplyCommand, replyCommandOptions } from './aplication/replyCommand';
import { UsersUsingACommand } from './aplication/utils/usersUsingACommand';
import { DiceCommandSchema } from './domain/commandSchema/diceCommandSchema';
import { SchemaDictionary } from './domain/interfaces/schemaDictionary';
import { Routes } from './routes';

export class CommandHandler {
    constructor(
        private diceCommand: DiceCommand,
        private replyCommand: ReplyCommand,
        private routes: Routes,
        private usersUsingACommand: UsersUsingACommand,
        private prefix: string,
        private schemaDictionary: SchemaDictionary,
    ) {}

    public async isCommand(event: Message, adminRole: string) {
        // si un comando esta a la espera de una respuesta por parte de un usario,
        // ese usuario no podra interactuar con el bot
        if (this.usersUsingACommand.searchIdInUserList(event.author.id)) return;

        // si el comando tiene prefijo, para comandos con prefijo
        if (event.content.startsWith(this.prefix)) {
            return this.isPrefixCommand(event, adminRole);
        }

        // si el comando tien D para dados
        if (event.content.includes(`${DiceCommandSchema.aliases[0]}`)) {
            // si los dados estan activos
            if (this.diceCommand.isDiceCommandActive) {
                console.log('Guild: ', event.guild?.name);
                console.log('Command: Dice command');
                return await this.diceCommand.call(
                    event,
                    adminRole,
                    this.schemaDictionary['Dice Command'],
                );
            }
            return;
        }

        // si la funcion de respuesta
        if (this.replyCommand.isReplyCommandActive) {
            // mirar si tiene ciertas palabras, para la respuesta
            for (const key of Object.keys(replyCommandOptions)) {
                console.log(event.content.includes(`${key}`), key);
                if (event.content.includes(`${key}`)) {
                    console.log('Guild: ', event.guild?.name);
                    console.log('Command: Reply command');
                    return await this.replyCommand.call(
                        event,
                        adminRole,
                        this.schemaDictionary['Reply Command'],
                    );
                }
            }
            return;
        }
        return;
    }

    private async isPrefixCommand(event: Message, adminRole: string) {
        let command: string;
        if (event.content.includes(' ')) {
            // si el mensaje tiene ' ', mirar command antes del ' '
            const endCommandPosition = event.content.search(' ');
            command = event.content.substring(this.prefix.length, endCommandPosition);
        } else {
            // si no tiene espacio, todo es el command
            command = event.content.substring(this.prefix.length);
        }

        for (const route of this.routes.routeList) {
            if (route.schema.aliases.find((alias) => alias === command.toLowerCase())) {
                console.log('Guild: ', event.guild?.name);
                console.log('Command: ', route.schema.command);

                // we cant take route.schema directly becouse this dont get update when schemas are updated
                const schema = this.schemaDictionary[`${route.schema.command}`];

                if (route.command instanceof DiceCommandToggler) {
                    return route.command.call(event, adminRole, schema, {
                        diceCommand: this.diceCommand,
                    });
                }

                if (route.command instanceof ReplyCommandToggler) {
                    return route.command.call(event, adminRole, schema, {
                        replyCommand: this.replyCommand,
                    });
                }

                if (route.command instanceof HelpCommand) {
                    return route.command.call(event, adminRole, schema, {
                        prefix: this.prefix,
                        schemaList: this.schemaDictionary,
                    });
                }

                if (route.command instanceof ConfigSchemaCommand) {
                    return route.command.call(event, adminRole, schema, {
                        schemaList: this.schemaDictionary,
                    });
                }

                return route.command.call(event, adminRole, schema);
            }
        }
    }

    public resetPrefix(newPrefix: string) {
        this.prefix = newPrefix;
    }

    public resetSchemas(newSchemas: SchemaDictionary) {
        this.schemaDictionary = newSchemas;
    }
}
