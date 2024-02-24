import { CommandsNameEnum } from '../enums/commandNamesEnum';
import { CommandsCategoryEnum } from '../enums/commandsCategoryEnum';
import { CommandSchema } from '../interfaces/commandSchema';

export const DeletePlaylistCommandSchema: CommandSchema = {
  name: 'schemas.deletePlaylist.name',
  // Eliminar playlist
  aliases: ['dpl', 'deletepl', 'deleteplaylist'],
  coolDown: 0,
  adminOnly: false,
  description: 'schemas.deletePlaylist.description',
  // 'Este comando permite eliminar una playlists creada por uno mismo o del servidor.\n' +
  // 'Para eliminar una playlist del servidor hay que añadir  `guild` al comando. Se requiere obligatoriamente tener admin role.\n\n' +
  // '__Mientras este comando este en uso, no se podrán usar otros comandos. \nSe cerrará automáticamente tras 1min de inactividad.__',
  command: CommandsNameEnum.DeletePlaylistCommand,
  category: CommandsCategoryEnum.PLAYLIST,
};
