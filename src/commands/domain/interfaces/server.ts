import { Message } from 'discord.js';

export interface Server {
    id: string;
    prefix: string;
    adminRole: string;
    blackList: string[];
    instance: CommandsHandler;
}

abstract class CommandsHandler {
    abstract isCommand(event: Message): void;
    abstract resetPrefix(newPrefix: string): void;
}
