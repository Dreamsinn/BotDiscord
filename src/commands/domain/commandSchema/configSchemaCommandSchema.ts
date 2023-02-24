import { CommandsNameEnum } from '../enums/commandNamesEnum';
import { CommandsCategoryEnum } from '../enums/commandsCategoryEnum';
import { CommandSchema } from '../interfaces/commandSchema';

export const ConfigSchemaCommandSchema: CommandSchema = {
    name: 'Configurar el servidor',
    aliases: ['configSchema', 'configCommand', 'command', 'schema'],
    coolDown: 0,
    adminOnly: false,
    description: '\u200b',
    command: CommandsNameEnum.ConfigSchemaCommand,
    category: CommandsCategoryEnum.PREFIX,
};
