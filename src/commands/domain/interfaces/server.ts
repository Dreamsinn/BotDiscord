import { Message } from 'discord.js';
import { SchemaDictionary } from './schemaDictionary';

export interface Server {
    id: string;
    prefix: string;
    adminRole: string;
    blackList: string[];
    instance: CommandsHandler;
}

abstract class CommandsHandler {
    abstract isCommand(event: Message, adminRole: string): void;
    abstract resetPrefix(newPrefix: string): void;
    abstract resetSchemas(newSchemas: SchemaDictionary): void;
}
