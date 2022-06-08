import { CommandSchema } from '../interfaces/commandSchema';

const ShufflePlayListCommandSchema: CommandSchema = {
    aliases: ['shuffle', 'pls'],
    coolDown: 120,
    devOnly: false,
    description: 'Randomize the order of songs on the playlist',
    category: 'prefix',
    name: 'shuffle',
};

export { ShufflePlayListCommandSchema };
