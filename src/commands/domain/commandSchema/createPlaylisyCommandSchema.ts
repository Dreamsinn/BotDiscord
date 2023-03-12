import { CommandsNameEnum } from '../enums/commandNamesEnum';
import { CommandsCategoryEnum } from '../enums/commandsCategoryEnum';
import { CommandSchema } from '../interfaces/commandSchema';

export const CreatePlaylistCommandSchema: CommandSchema = {
    name: 'Crear playlist',
    aliases: ['cpl', 'createpl', 'createplaylist'],
    coolDown: 0,
    adminOnly: false,
    description:
        'Este comando permite crear playlist tanto personal como para el servidor.\n' +
        'Hay que tener en cuenta:\n' +
        '> - No se pueden repetir nombres por usuario o servidor.' +
        '> - Para crear una playlist para el servidor hay que añadir  ``` guild``` al comando.' +
        '> - Crear una playlist para el servidor requiere obligatoriamente tener admin role.\n\n' +
        '__Durante este proceso no se podrán usar otros comandos.__',
    command: CommandsNameEnum.CreatePlaylistCommand,
    category: CommandsCategoryEnum.MUSIC,
};
