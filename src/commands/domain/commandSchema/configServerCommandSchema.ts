import { CommandsNameEnum } from '../enums/commandNamesEnum';
import { CommandsCategoryEnum } from '../enums/commandsCategoryEnum';
import { CommandSchema } from '../interfaces/commandSchema';

export const ConfigServerCommandSchema: CommandSchema = {
    name: 'Configurar el servidor',
    aliases: ['config'],
    coolDown: 0,
    adminOnly: false,
    description:
        'Este comando permite gestionar los siguientes apartados del bot en el servidor: \n' +
        '> - Prefijo \n' +
        '> - Admin role (solo puede haber un admin role) \n' +
        '> - Blacklist \n' +
        '> - Idioma \n\n' +
        '__Mientras este comando este en uso, no se podrán usar otros comandos. \nSe cerrará automáticamente tras 1min de inactividad.__',
    command: CommandsNameEnum.ConfigServerCommand,
    category: CommandsCategoryEnum.PREFIX,
};
