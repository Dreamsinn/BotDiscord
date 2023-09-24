import { Message } from 'discord.js';
import { Languages } from '../languages/languageService';
import { DiceCommand } from './aplication/non-prefixCommands/diceCommand';
import { ReplyCommand, replyCommandOptions } from './aplication/non-prefixCommands/replyCommand';
import { ConfigSchemaCommand } from './aplication/prefixCommands/configSchemaCommand/configSchemaCommand';
import { DiceCommandToggler } from './aplication/prefixCommands/diceCommandToggler';
import { HelpCommand } from './aplication/prefixCommands/helpCommand';
import { PlayCommand } from './aplication/prefixCommands/musicCommands/playCommand';
import { ReplyCommandToggler } from './aplication/prefixCommands/replyCommandToggler';
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
        private language: Languages,
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
        console.log('lenguage =', this.language);
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

                // before use the command instance it
                const command = new route.command(...route.dependencies);

                if (command instanceof DiceCommandToggler) {
                    return command.call(event, adminRole, schema, {
                        diceCommand: this.diceCommand,
                    });
                }

                if (command instanceof ReplyCommandToggler) {
                    return command.call(event, adminRole, schema, {
                        replyCommand: this.replyCommand,
                    });
                }

                if (command instanceof HelpCommand) {
                    return command.call(event, adminRole, schema, {
                        prefix: this.prefix,
                        schemaList: this.schemaDictionary,
                        language: this.language,
                    });
                }

                if (command instanceof ConfigSchemaCommand) {
                    return command.call(event, adminRole, schema, {
                        schemaList: this.schemaDictionary,
                    });
                }

                if (command instanceof PlayCommand) {
                    return command.call(event, adminRole, schema, {
                        usersUsingACommand: this.usersUsingACommand,
                    });
                }

                return command.call(event, adminRole, schema);
            }
        }
    }

    public resetServerData(newPrefix: string, newLanguage: Languages) {
        this.prefix = newPrefix;
        this.language = newLanguage;
    }

    public resetSchemas(newSchemas: SchemaDictionary) {
        this.schemaDictionary = newSchemas;
    }
}
