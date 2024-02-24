import { Message } from 'discord.js';
import { Languages } from '../../../languages/languageService';
import { SchemaDictionary } from './schemaDictionary';

export interface Server {
  id: string;
  prefix: string;
  adminRole: string;
  blackList: string[];
  instance: CommandsHandler;
  language: Languages;
}

abstract class CommandsHandler {
  abstract isCommand(event: Message, adminRole: string): void;
  abstract resetServerData(newPrefix: string, newLanguage: Languages): void;
  abstract resetSchemas(newSchemas: SchemaDictionary): void;
}
