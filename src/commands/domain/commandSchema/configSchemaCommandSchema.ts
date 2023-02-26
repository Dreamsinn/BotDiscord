import { CommandsNameEnum } from '../enums/commandNamesEnum';
import { CommandsCategoryEnum } from '../enums/commandsCategoryEnum';
import { CommandSchema } from '../interfaces/commandSchema';

export const ConfigSchemaCommandSchema: CommandSchema = {
    name: 'Configurar el servidor',
    aliases: ['configSchema', 'configCommand', 'command', 'schema'],
    coolDown: 0,
    adminOnly: false,
    description:
        'Este comando permite cambiar el cooldown y si es necesario el admin role en los comandos.\n' +
        'Hay que tener en cuenta:\n' +
        '> - Durante el proceso el usuario no podrá usar otros comandos.' +
        '> - El cooldown esta en milisegundos.',
    command: CommandsNameEnum.ConfigSchemaCommand,
    category: CommandsCategoryEnum.PREFIX,
};
