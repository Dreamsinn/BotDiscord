import { Message } from 'discord.js';

export interface ServerList {
    serverId: string;
    instance: CommandsHandler;
}

abstract class CommandsHandler {
    abstract isCommand(event: Message);
}
