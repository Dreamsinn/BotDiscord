import { CommandSchema } from '../interfaces/commandSchema';

const PlayListCommandSchema: CommandSchema = {
    aliases: ['playlist', 'pl'],
    coolDown: 0,
    devOnly: false,
    description: 'show up list of music requested, paginated',
    category: 'prefix',
    name: 'playList',
};

export { PlayListCommandSchema };
