import { Message } from 'discord.js';
import { DiceCommand } from './aplication/diceCommand';
import { DiceCommandToggler } from './aplication/prefixCommands/diceCommandToggler';
import { ReplyCommandToggler } from './aplication/prefixCommands/replyCommandToggler';
import { ReplyCommand, replyCommandOptions } from './aplication/replyCommand';
import { UsersUsingACommand } from './aplication/utils/usersUsingACommand';
import { DiceCommandSchema } from './domain/commandSchema/diceCommandSchema';
import { Routes } from './routes';

export class CommandHandler {
    private diceCommand: DiceCommand;
    private replyCommand: ReplyCommand;
    private routes: Routes;
    private usersUsingACommand: UsersUsingACommand;
    constructor(
        diceCommand: DiceCommand,
        replyCommand: ReplyCommand,
        routes: Routes,
        usersUsingACommand: UsersUsingACommand,
    ) {
        this.diceCommand = diceCommand;
        this.replyCommand = replyCommand;
        this.routes = routes;
        this.usersUsingACommand = usersUsingACommand;
    }

    public async isCommand(event: Message) {
        // si un comando esta a la espera de una respuesta por parte de un usario,
        // ese usuario no podra interactuar con el bot
        if (this.usersUsingACommand.searchIdInUserList(event.author.id)) return;
        console.log(event.guild.name);

        // si el comando tiene prefijo, para comandos con prefijo
        if (event.content.startsWith(`${process.env.PREFIX}`)) {
            console.log('prefix founded');
            return this.isPrefixCommand(event);
        }

        // si el comando tien D para dados
        if (event.content.includes(`${DiceCommandSchema.aliases[0]}`)) {
            // si los dados estan activos
            if (this.diceCommand.isDiceCommandActive) {
                console.log('contains D');
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
                    return await this.replyCommand.call(event);
                }
            }
            return;
        }

        console.log('it is not a command');
        return;
    }

    private async isPrefixCommand(event: Message) {
        let command: string;
        if (event.content.includes(' ')) {
            // si el mensaje tiene ' ', mirar command antes del ' '
            const endCommandPosition = event.content.search(' ');
            command = event.content.substring(1, endCommandPosition);
        } else {
            // si no tiene espacio, todo es el command
            command = event.content.substring(1);
        }
        console.log(command);
        for (const route of this.routes.routeList) {
            if (route.alias.find((alias) => alias === command.toLowerCase())) {
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
        console.log('its not a command');
    }
}
