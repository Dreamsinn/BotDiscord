import { CommandsNameEnum } from '../enums/commandNamesEnum';
import { CommandsCategoryEnum } from '../enums/commandsCategoryEnum';
import { CommandSchema } from '../interfaces/commandSchema';

const ClearPlayListCommandSchema: CommandSchema = {
  name: 'schemas.clearPlaylist.name',
  // Borrar playlist
  aliases: ['c', 'clear'],
  coolDown: 0,
  adminOnly: false,
  description: 'schemas.clearPlaylist.description',
  // Este comando borra todas las canciones de la playlist.
  command: CommandsNameEnum.ClearPlaylistCommand,
  category: CommandsCategoryEnum.MUSIC,
};

export { ClearPlayListCommandSchema };
