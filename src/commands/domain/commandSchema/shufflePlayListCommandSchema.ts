import { CommandsNameEnum } from '../enums/commandNamesEnum';
import { CommandsCategoryEnum } from '../enums/commandsCategoryEnum';
import { CommandSchema } from '../interfaces/commandSchema';

const ShufflePlayListCommandSchema: CommandSchema = {
  name: 'schemas.shuffleCommand.name',
  // Barajar el orden de las canciones
  aliases: ['shuffle'],
  coolDown: 120,
  adminOnly: false,
  description: 'schemas.shuffleCommand.description',
  // 'Aleatoriza el orden de las canciones de la playlist.',
  command: CommandsNameEnum.ShufflePlaylistCommand,
  category: CommandsCategoryEnum.MUSIC,
};

export { ShufflePlayListCommandSchema };
