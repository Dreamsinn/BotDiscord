import { CommandsNameEnum } from '../enums/commandNamesEnum';
import { CommandsCategoryEnum } from '../enums/commandsCategoryEnum';
import { CommandSchema } from '../interfaces/commandSchema';

const ShowPlaylistCommandSchema: CommandSchema = {
    name: 'schemas.showPlaylist.name',
    // Ver playlists guardadas en la base de datos
    aliases: ['spl', 'showpl', 'showplaylist'],
    coolDown: 0,
    adminOnly: false,
    description: 'schemas.showPlaylist.description',
    // 'Este comando permite ver las playlist creadas por uno mismo o las del servidor.\n' +
    // 'Para ver una playlist del servidor hay que añadir  `guild` al comando. Se requiere obligatoriamente tener admin role.\n\n' +
    // '__Mientras este comando este en uso, no se podrán usar otros comandos. \nSe cerrará automáticamente tras 1min de inactividad.__',
    command: CommandsNameEnum.ShowPlayListCommand,
    category: CommandsCategoryEnum.MUSIC,
};

export { ShowPlaylistCommandSchema };
