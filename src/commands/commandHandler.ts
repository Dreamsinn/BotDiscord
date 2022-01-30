import {ReplyCommand, replyCommandOptions} from "./aplication/replyCommand";

export class CommandHandler {

    public async isCommand(event){
        if (event.content.startsWith(`${process.env.PREFIX}`)){
            console.log('tiene prefijo')
            return
        }

        for ( const key of Object.keys(replyCommandOptions)){
            console.log(event.content.includes(`${key}`), key)
            if(event.content.includes(`${key}`)){
                console.log('esta en replyCommandOptions')
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
        console.log('no es un comando', new Date)
        return
    }
}