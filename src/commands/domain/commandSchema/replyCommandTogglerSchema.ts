import { CommandsCategoryEnum } from '../enums/commandsCategoryEnum';
import { CommandSchema } from '../interfaces/commandSchema';

const ReplyCommandTogglerSchema: CommandSchema = {
    aliases: ['reply'],
    coolDown: 0,
    adminOnly: false,
    description:
        'Activa o desactiva el comando de respuestas.\n' +
        'Este comando debe ir seguido de `on` u `off`\n' +
        `Ejemplo: reply on`,
    category: CommandsCategoryEnum.PREFIX,
    name: 'Activador del commando de respuestas',
};

export { ReplyCommandTogglerSchema };
