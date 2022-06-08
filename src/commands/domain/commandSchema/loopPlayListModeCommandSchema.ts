import { CommandSchema } from '../interfaces/commandSchema';

const LoopPlayListModeCommandSchema: CommandSchema = {
    aliases: ['loop'],
    coolDown: 0,
    devOnly: false,
    description:
        'Put the playlist in loop mode.\n' +
        'When music is played, this will go to the end of the playlist.\n' +
        'This command must go followed by ON of OFF\n' +
        `Example: \n${process.env.PREFIX}loop on`,
    category: 'prefix',
    name: 'loop',
};

export { LoopPlayListModeCommandSchema };
