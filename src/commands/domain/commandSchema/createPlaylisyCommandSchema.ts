import { CommandsNameEnum } from '../enums/commandNamesEnum';
import { CommandsCategoryEnum } from '../enums/commandsCategoryEnum';
import { CommandSchema } from '../interfaces/commandSchema';

export const CreatePlaylistCommandSchema: CommandSchema = {
  name: 'schemas.createPlaylist.name',
  // Crear playlist
  aliases: ['cpl', 'createpl', 'createplaylist'],
  coolDown: 0,
  adminOnly: false,
  description: 'schemas.createPlaylist.description',
  // 'Este comando permite crear playlist tanto personal como para el servidor.\n' +
  // 'Hay que tener en cuenta:\n' +
  // '> - Un servidor o un usuario no pueden tener 2 playlists con el mismo nombre. \n' +
  // '> - Para crear una playlist para el servidor hay que añadir  `guild` al comando. \n' +
  // '> - Crear una playlist para el servidor requiere obligatoriamente tener admin role.\n\n' +
  // '__Mientras este comando este en uso, no se podrán usar otros comandos. \nSe cerrará automáticamente tras 1min de inactividad.__',
  command: CommandsNameEnum.CreatePlaylistCommand,
  category: CommandsCategoryEnum.PLAYLIST,
};
