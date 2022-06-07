import { CommandSchema } from '../interfaces/commandSchema';

const JoinChannelCommandSchema: CommandSchema = {
    aliases: ['j', 'join'],
    coolDown: 0,
    devOnly: false,
    description:
        'Join the bot to the current voice channel, no needed if bot is not already in a channel',
    category: 'prefix',
    name: 'Join',
};

export { JoinChannelCommandSchema };
