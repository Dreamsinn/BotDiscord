import { CommandsNameEnum } from '../enums/commandNamesEnum';
import { CommandsCategoryEnum } from '../enums/commandsCategoryEnum';
import { CommandSchema } from '../interfaces/commandSchema';

const PlayPlaylistCommandSchema: CommandSchema = {
  name: 'schemas.playPlaylist.name',
  // Play playlist creadas
  aliases: ['ppl', 'playpl', 'playplaylist'],
  coolDown: 0,
  adminOnly: false,
  description: 'schemas.playPlaylist.description',
  // 'Este comando permite reproducir playlists ya creadas. \n' +
  // 'Muestra una lista paginada de las tus playlists y se reproduce la elegida. \n' +
  // 'Hay que tener en cuenta:\n' +
  // '> - Para elegir una playlist del servidor hay que añadir `guild` al comando. \n' +
  // '> - Elegir una playlist del servidor requiere obligatoriamente tener admin role.\n\n' +
  // '__Mientras este comando este en uso, no se podrán usar otros comandos. \nSe cerrará automáticamente tras 1min de inactividad.__',
  command: CommandsNameEnum.PlayPlaylistCommand,
  category: CommandsCategoryEnum.PLAYLIST,
};

export { PlayPlaylistCommandSchema };
