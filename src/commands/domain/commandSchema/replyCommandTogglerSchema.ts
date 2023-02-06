import { CommandsNameEnum } from '../enums/commandNamesEnum';
import { CommandsCategoryEnum } from '../enums/commandsCategoryEnum';
import { CommandSchema } from '../interfaces/commandSchema';

const ReplyCommandTogglerSchema: CommandSchema = {
    name: 'Activador del commando de respuestas',
    aliases: ['reply'],
    coolDown: 0,
    adminOnly: false,
    description:
        'Activa o desactiva el comando de respuestas.\n' +
        'Este comando debe ir seguido de `on` u `off`\n' +
        `Ejemplo: reply on`,
    command: CommandsNameEnum.ReplyCommandToggler,
    category: CommandsCategoryEnum.PREFIX,
};

export { ReplyCommandTogglerSchema };
