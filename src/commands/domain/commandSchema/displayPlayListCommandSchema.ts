import { CommandSchema } from '../interfaces/commandSchema';

const DisplayPlayListCommandSchema: CommandSchema = {
    aliases: ['display'],
    coolDown: 0,
    devOnly: false,
    description:
        'Send an embed message to the channel that shows all the playlist data,' +
        'in which you have access to all playlist commands just by clicking emojis.',
    category: 'prefix',
    name: 'disconnect',
};

export { DisplayPlayListCommandSchema };
