import { CommandsNameEnum } from '../enums/commandNamesEnum';
import { CommandsCategoryEnum } from '../enums/commandsCategoryEnum';
import { CommandSchema } from '../interfaces/commandSchema';

const PlayListCommandSchema: CommandSchema = {
  name: 'schemas.playlistCommand.name',
  // Ver playlist actual
  aliases: ['playlist', 'pl'],
  coolDown: 0,
  adminOnly: false,
  description: 'schemas.playlistCommand.description',
  // 'Muestra una lista paginada de todas las canciones, con su duración, de la playlist que está sonando.',
  command: CommandsNameEnum.PlaylistCommand,
  category: CommandsCategoryEnum.MUSIC,
};

export { PlayListCommandSchema };
