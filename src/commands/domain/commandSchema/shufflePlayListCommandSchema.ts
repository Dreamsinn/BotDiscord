import { CommandsCategoryEnum } from '../enums/commandsCategoryEnum';
import { CommandSchema } from '../interfaces/commandSchema';

const ShufflePlayListCommandSchema: CommandSchema = {
    aliases: ['shuffle'],
    coolDown: 120,
    devOnly: false,
    description: 'Aleatoriza el orden de las canciones de la playlist.',
    category: CommandsCategoryEnum.MUSIC,
    name: 'Barajar el orden de las canciones',
};

export { ShufflePlayListCommandSchema };
