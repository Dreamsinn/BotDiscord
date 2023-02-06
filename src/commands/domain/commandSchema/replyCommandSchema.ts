import { CommandsNameEnum } from '../enums/commandNamesEnum';
import { CommandsCategoryEnum } from '../enums/commandsCategoryEnum';
import { CommandSchema } from '../interfaces/commandSchema';

const ReplyCommandSchema: CommandSchema = {
    name: 'Commando de respuesta',
    aliases: ['cinco', '5', 'trece', '13'],
    coolDown: 0,
    adminOnly: false,
    description:
        'Requiere de un comando de prefijo para ser activado:\n' +
        '- `reply on`, de la misma forma, off para desactivarla.\n' +
        'Este comando cuando este activo leerá todos los mensajes y al encontrar un alias ara una chanza.',
    command: CommandsNameEnum.ReplyCommand,
    category: CommandsCategoryEnum.NONPREFIX,
};

export { ReplyCommandSchema };
