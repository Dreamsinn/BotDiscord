import { CommandSchema } from '../interfaces/commandSchema';

const ReplyCommandTogglerSchema: CommandSchema = {
    aliases: ['reply'],
    coolDown: 0,
    devOnly: false,
    description:
        'Activa o desactiva el comando de respuestas.\n' +
        'Este comando debe ir seguido de ON o OFF\n' +
        `Egemplo: \n${process.env.PREFIX}reply on`,
    category: 'prefix',
    name: 'toggleReplyCommand',
};

export { ReplyCommandTogglerSchema };
