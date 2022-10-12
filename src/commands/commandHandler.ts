import { Message } from 'discord.js';
import { DiceCommand } from './aplication/diceCommand';
import { DiceCommandToggler } from './aplication/prefixCommands/diceCommandToggler';
import { HelpCommand } from './aplication/prefixCommands/helpCommand';
import { PlayCommand } from './aplication/prefixCommands/musicCommands/playCommand';
import { RemoveSongsFromPlayListCommand } from './aplication/prefixCommands/musicCommands/removeSongsFromPlayListCommand';
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
        if (this.usersUsingACommand.searchIdInUserList(event.author.id)) return;
        console.log(event.guild.name);

        if (event.content.startsWith(`${process.env.PREFIX}`)) {
            console.log('prefix founded');
            return this.isPrefixCommand(event);
        }

        if (event.content.includes(`${DiceCommandSchema.aliases[0]}`)) {
            if (this.diceCommand.isDiceCommandActive) {
                console.log('contains D');
                return await this.diceCommand.call(event);
            }
            return;
        }

        if (this.replyCommand.isReplyCommandActive) {
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
            const endCommandPosition = event.content.search(' ');
            command = event.content.substring(1, endCommandPosition);
        } else {
            command = event.content.substring(1);
        }
        console.log(command);
        for (const route of this.routes.routeList) {
            if (route.alias.find((alias) => alias === command.toLowerCase())) {
                if (
                    route.command instanceof HelpCommand ||
                    route.command instanceof PlayCommand ||
                    route.command instanceof RemoveSongsFromPlayListCommand
                ) {
                    return route.command.call(event, this.usersUsingACommand);
                }

                if (route.command instanceof DiceCommandToggler) {
                    return route.command.call(event, this.diceCommand);
                }

                if (route.command instanceof ReplyCommandToggler) {
                    return route.command.call(event, this.replyCommand);
                }

                return route.command.call(event);
            }
        }
        console.log('its not a command');
    }
}
