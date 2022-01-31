import {ReplyCommand, replyCommandOptions} from "./aplication/replyCommand";
import {DiceCommand} from "./aplication/diceCommand";

export class CommandHandler {
    diceCommand = new DiceCommand();
    public async isCommand(event){
        if (event.content.startsWith(`${process.env.PREFIX}`)){
            console.log('prefix founded')
            return
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

        console.log('it is not a command', new Date)
        return
    }
}