import { CommandsNameEnum } from '../enums/commandNamesEnum';
import { CommandsCategoryEnum } from '../enums/commandsCategoryEnum';
import { CommandSchema } from '../interfaces/commandSchema';

export const UpdatePlaylistCommandSchema: CommandSchema = {
    name: 'schemas.updatePlaylist.name',
    // Modificar playlist
    aliases: ['upl', 'updatepl', 'updateplaylist'],
    coolDown: 0,
    adminOnly: false,
    description: 'schemas.updatePlaylist.description',
    // 'Este comando permite modificar playlists ya creadas.\n' +
    // 'Hay que tener en cuenta:\n' +
    // '> - Un servidor o un usuario no pueden tener 2 playlists con el mismo nombre. \n' +
    // '> - Para modificar una playlist del servidor hay que añadir  `guild` al comando. \n' +
    // '> - Modificar una playlist del servidor requiere obligatoriamente tener admin role.\n\n' +
    // '__Mientras este comando este en uso, no se podrán usar otros comandos. \nSe cerrará automáticamente tras 1min de inactividad.__',
    command: CommandsNameEnum.UpdatePlaylistCommand,
    category: CommandsCategoryEnum.MUSIC,
};
