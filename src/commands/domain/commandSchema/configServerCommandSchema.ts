import { CommandsNameEnum } from '../enums/commandNamesEnum';
import { CommandsCategoryEnum } from '../enums/commandsCategoryEnum';
import { CommandSchema } from '../interfaces/commandSchema';

export const ConfigServerCommandSchema: CommandSchema = {
    name: 'Configurar el servidor',
    aliases: ['config'],
    coolDown: 0,
    adminOnly: false,
    description:
        'Este comando permite cambiar el prefijo en el servidor, el admin role del bot, y añadir y quitar usuarios a la blacklist.\n' +
        'Hay que tener en cuenta:\n' +
        '> - Durante el proceso el usuario no podrá usar otros comandos.' +
        '> - Solo puede haber un admin role.',
    command: CommandsNameEnum.ConfigServerCommand,
    category: CommandsCategoryEnum.PREFIX,
};
