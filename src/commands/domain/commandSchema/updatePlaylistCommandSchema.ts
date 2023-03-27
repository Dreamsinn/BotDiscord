import { CommandsNameEnum } from '../enums/commandNamesEnum';
import { CommandsCategoryEnum } from '../enums/commandsCategoryEnum';
import { CommandSchema } from '../interfaces/commandSchema';

export const UpdatePlaylistCommandSchema: CommandSchema = {
    name: 'Crear playlist',
    aliases: ['updatepl', 'updateplaylist'],
    coolDown: 0,
    adminOnly: false,
    description:
        'Este comando permite modificar playlist ya creadas.\n' +
        'Hay que tener en cuenta:\n' +
        '> - No se pueden repetir nombres por usuario o servidor.' +
        '> - Para modificar una playlist del servidor hay que añadir  ``` guild``` al comando.' +
        '> - Modificar una playlist del servidor requiere obligatoriamente tener admin role.\n\n' +
        '__Durante este proceso no se podrán usar otros comandos.__',
    command: CommandsNameEnum.UpdatePlaylistCommand,
    category: CommandsCategoryEnum.MUSIC,
};
