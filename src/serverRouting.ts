import { Message } from 'discord.js';
import { DiceCommand } from './commands/aplication/diceCommand';
import { ReplyCommand } from './commands/aplication/replyCommand';
import { UsersUsingACommand } from './commands/aplication/utils/usersUsingACommand';
import { CommandHandler } from './commands/commandHandler';
import { ServerList } from './commands/domain/interfaces/serverList';
import { Routes } from './commands/routes';

export class ServerRouting {
    private serverList: ServerList[] = [];

    public async call(event: Message) {
        // mira si el servidor ya ha sido instanciado, si es asi llama a la instancia
        for (const server of this.serverList) {
            if (server.serverId === event.guildId) {
                return await server.instance.isCommand(event);
            }
        }

        // instancia el servidor y vuleve a llamar esta funcion
        return this.addSeverToServerList(event);
    }

    private addSeverToServerList(event: Message) {
        const diceCommand = new DiceCommand();
        const replyCommand = new ReplyCommand();
        const usersUsingACommand = new UsersUsingACommand();
        const routes = new Routes(usersUsingACommand);
        const commandHandler = new CommandHandler(diceCommand, replyCommand, routes, usersUsingACommand);

        const newServer: ServerList = {
            serverId: event.guildId,
            instance: commandHandler,
        };

        this.serverList.push(newServer);

        return this.call(event);
    }
}
