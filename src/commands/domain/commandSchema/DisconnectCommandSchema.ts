import { CommandSchema } from '../interfaces/commandSchema';

const DisconnectCommandSchema: CommandSchema = {
    aliases: ['dc', 'disconnect'],
    coolDown: 0,
    devOnly: false,
    description: 'disconnect the bot from the voice channel',
    category: 'prefix',
    name: 'disconnect',
};

export { DisconnectCommandSchema };
