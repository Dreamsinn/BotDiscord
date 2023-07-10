import { CommandsNameEnum } from '../enums/commandNamesEnum';
import { CommandsCategoryEnum } from '../enums/commandsCategoryEnum';
import { CommandSchema } from '../interfaces/commandSchema';

export const ConfigSchemaCommandSchema: CommandSchema = {
    name: 'schemas.configSchemas.name',
    // Configurar esquemas
    aliases: ['command', 'schema'],
    coolDown: 0,
    adminOnly: false,
    description: 'schemas.configSchemas.description',
    // 'Este comando permite gestionar el cooldown y si el comando necesita admin role (true/false) en los comandos.\n' +
    //     'Hay que tener en cuenta:\n' +
    //     '> - El tiempo de cd es en milisegundos. \n' +
    //     '> - Respecto el admin role, al seleccionar un comando este automáticamente cambiara al contrario de como esta. Ej: si está en true, se pondrá en false. \n\n' +
    //     '__Mientras este comando este en uso, no se podrán usar otros comandos. \nSe cerrará automáticamente tras 1min de inactividad.__ ',
    command: CommandsNameEnum.ConfigSchemaCommand,
    category: CommandsCategoryEnum.PREFIX,
};
