import { Message } from 'discord.js';
import { DiceCommand } from './aplication/diceCommand';
import { DiceCommandToggler } from './aplication/prefixCommands/diceCommandToggler';
import { ReplyCommandToggler } from './aplication/prefixCommands/replyCommandToggler';
import { ReplyCommand, replyCommandOptions } from './aplication/replyCommand';
import { UsersUsingACommand } from './aplication/utils/usersUsingACommand';
import { DiceCommandSchema } from './domain/commandSchema/diceCommandSchema';
import { Routes } from './routes';

export class CommandHandler {
    constructor(
        private diceCommand: DiceCommand,
        private replyCommand: ReplyCommand,
        private routes: Routes,
        private usersUsingACommand: UsersUsingACommand,
        private prefix: string,
    ) {}

    public async isCommand(event: Message) {
        // si un comando esta a la espera de una respuesta por parte de un usario,
        // ese usuario no podra interactuar con el bot
        if (this.usersUsingACommand.searchIdInUserList(event.author.id)) return;

        // si el comando tiene prefijo, para comandos con prefijo
        if (event.content.startsWith(this.prefix)) {
            return this.isPrefixCommand(event);
        }

        // si el comando tien D para dados
        if (event.content.includes(`${DiceCommandSchema.aliases[0]}`)) {
            // si los dados estan activos
            if (this.diceCommand.isDiceCommandActive) {
                console.log('Guild: ', event.guild?.name);
                console.log('Command: Dice command');
                return await this.diceCommand.call(event);
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
                    return await this.replyCommand.call(event);
                }
            }
            return;
        }
        return;
    }

    private async isPrefixCommand(event: Message) {
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

                if (route.command instanceof DiceCommandToggler) {
                    return route.command.call(event, this.diceCommand);
                }

                if (route.command instanceof ReplyCommandToggler) {
                    return route.command.call(event, this.replyCommand);
                }

                // mirar si se encuentra el comando en los alias
                return route.command.call(event);
            }
        }
    }

    public resetPrefix(newPrefix: string) {
        this.prefix = newPrefix;
        this.routes.resetPrefix(newPrefix);
    }
}
