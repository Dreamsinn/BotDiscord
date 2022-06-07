import { CommandSchema } from '../interfaces/commandSchema';

const RemoveSongsFromPlayListCommandSchema: CommandSchema = {
    aliases: ['rm', 'remove'],
    coolDown: 0,
    devOnly: false,
    description:
        'Remove n songs form playlist, at execute the comand a paginated playlist appears.' +
        'The bot will read the next message you write and delete selected muscis.' +
        'To select music just write the number of the music, to slect more of one split them with " , "\n' +
        'Ex: 1, 6, 23',
    category: 'prefix',
    name: 'Remove Songs',
    usage: 'remove',
    slash: {},
    contextChat: '',
    contextUser: '',
};

export { RemoveSongsFromPlayListCommandSchema };
