import { Message } from 'discord.js';
import { DiceCommand } from './commands/aplication/diceCommand';
import { ReplyCommand } from './commands/aplication/replyCommand';
import { CommandHandler } from './commands/commandHandler';
import { Command } from './commands/domain/interfaces/Command';
import { Routes } from './commands/routes';

interface ServerList {
    serverId: string,
    event: Message,
    instance: Command
}

export class ServerRouting {
    serverList: ServerList[] = []

    public async call(event: Message){
        // mira si el servidor ya ha sido instanciado, si es asi llama a la instancia
        for(const server of this.serverList){
            if(server.serverId === event.guildId){
                console.log(event.guild.name)
                return await server.instance.call(event)
            }
        }

        // instancia el servidor y vuleve a llamar esta funcion
        return this.addSeverToServerList(event)
    }

    private addSeverToServerList(event){
        const diceCommand = new DiceCommand();
        const replyCommand = new ReplyCommand();
        const routes = new Routes();
        const commandHandler = new CommandHandler(diceCommand, replyCommand, routes);

        const newServer: ServerList = {
            serverId: event.guildId,
            event: event,
            instance: commandHandler,
        }

        this.serverList.push(newServer)

        return this.call(event)
    }
}
