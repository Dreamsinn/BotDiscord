import {ReplyCommand, replyCommandOptions} from "./aplication/replyCommand";
import {DiceCommand} from "./aplication/diceCommand";
import {Route, routes} from "./routes";

export class CommandHandler {
    diceCommand: DiceCommand
    constructor(
         diceCommand: DiceCommand
    ) {
        this.diceCommand = diceCommand
    }
    // per inversio de dependencies, pases la dependencia al constructor, la creas fora y poses una = la mateixa,
    // tambes necesitas crearlo a la primera pagian, ya que la inversio es recursiva fins al principi

    // TODO: jordi, posar comentaris de que fa cada cosa
    public async isCommand(event) {
        if (event.content.startsWith(`${process.env.PREFIX}`)){
            // si el comando tiene prefijo, para comandos con prefijo
            console.log('prefix founded')
            return this.isPrefixCommand(event);
        }

        if (event.content.includes(`D`)){
            // si el comando tien D para dados
            console.log('contains D')
            return await this.diceCommand.call(event);
        }

        for (const key of Object.keys(replyCommandOptions)){
            // mirar si tiene ciertas palabras, para la respuesta
            console.log(event.content.includes(`${key}`), key)
            if(event.content.includes(`${key}`)){
                console.log('is in replyCommandOptions')
                const replyCommand = new ReplyCommand();
                return await replyCommand.call(event);
            }
        }
        console.log('it is not a command')
        return
    }

    private async isPrefixCommand(event){
        let command: string;
        if(event.content.includes(' ')){
            // si el mensaje tiene ' ', mirar command antes del ' '
            const endCommandPosition = event.content.search(' ');
            command = event.content.substring(1, endCommandPosition);
        } else {
            // si no tiene espacio, todo es el command
            command = event.content.substring(1);
        }
        console.log(command)
        for (const route of routes) {
            if (route.alias.find(alias => alias === command)){
                // mirar si se encuentra el comando en los alias
                return route.command.call(event);
            }
        }
        console.log('its not a command')
    }
}