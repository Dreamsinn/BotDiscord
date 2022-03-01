import {ReplyCommand, replyCommandOptions} from "./aplication/replyCommand";
import {DiceCommand} from "./aplication/diceCommand";
import {Route, routes} from "./routes";

export class CommandHandler {
    diceCommand = new DiceCommand();
    public async isCommand(event) {
        if (event.content.startsWith(`${process.env.PREFIX}`)){
            console.log('prefix founded')

            return this.isPrefixCommand(event);
        }

        if (event.content.includes(`D`)){
            console.log('contains D')
            return await this.diceCommand.call(event);
        }

        for ( const key of Object.keys(replyCommandOptions)){
            console.log(event.content.includes(`${key}`), key)
            if(event.content.includes(`${key}`)){
                console.log('is in replyCommandOptions')
                const replyCommand = new ReplyCommand;
                return await replyCommand.call(event);
            }
        }
        console.log('it is not a command')
        return
    }

    private async isPrefixCommand(event){
        let command: string;
        if(event.content.includes(' ')){
            const endCommandPosition = event.content.search(' ');
            command = event.content.substring(1, endCommandPosition);
        } else {
            command = event.content.substring(1);
        }
        console.log(command)
        for (const route of routes) {
            if (route.alias.find(alias => alias === command)){
                return route.command(event);
            }
        }
        console.log('its not a command')
    }
}