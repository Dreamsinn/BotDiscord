import { CommandsNameEnum } from '../enums/commandNamesEnum';
import { CommandsCategoryEnum } from '../enums/commandsCategoryEnum';
import { CommandSchema } from '../interfaces/commandSchema';

export const ConfigServerCommand: CommandSchema = {
    name: 'Configurar el servidor',
    aliases: ['config'],
    coolDown: 0,
    adminOnly: false,
    description: '',
    command: CommandsNameEnum.ConfigServerCommand,
    category: CommandsCategoryEnum.PREFIX,
};
