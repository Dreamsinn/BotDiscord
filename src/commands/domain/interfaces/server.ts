import { Message } from 'discord.js';

export interface Server {
    serverId: string;
    instance: CommandsHandler;
}

abstract class CommandsHandler {
    abstract isCommand(event: Message);
}
