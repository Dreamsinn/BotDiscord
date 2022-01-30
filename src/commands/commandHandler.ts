import {ReplyCommand, replyCommandOptions} from "./aplication/replyCommand";
import {DiceCommand} from "./aplication/diceCommand";

export class CommandHandler {

    public async isCommand(event){
        if (event.content.startsWith(`${process.env.PREFIX}`)){
            console.log('prefix founded')
            return
        }

        if (event.content.includes(`D`)){
            console.log('contains D')
            const diceCommand = new DiceCommand;
            return await diceCommand.call(event);
        }

        for ( const key of Object.keys(replyCommandOptions)){
            console.log(event.content.includes(`${key}`), key)
            if(event.content.includes(`${key}`)){
                console.log('is in replyCommandOptions')
                const replyCommand = new ReplyCommand;
                return await replyCommand.call(event);
            }
        }

        // Object.keys(replyCommandOptions).forEach( key => {
        //     console.log(event.content.search(`${key}`), key)
        //     if(event.content.search(`${key}`) !== -1){
        //         console.log('esta en replyCommandOptions')
        //         const replyCommand = new ReplyCommand;
        //         return await replyCommand.call(event);
        //     }
        // })
        console.log('it is not a command', new Date)
        return
    }
}