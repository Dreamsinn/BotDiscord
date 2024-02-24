import { CommandsNameEnum } from '../enums/commandNamesEnum';
import { CommandsCategoryEnum } from '../enums/commandsCategoryEnum';
import { CommandSchema } from '../interfaces/commandSchema';

const ReplyCommandSchema: CommandSchema = {
  name: 'schemas.replyCommand.name',
  // Comando de respuesta
  aliases: ['cinco', '5', 'trece', '13'],
  coolDown: 0,
  adminOnly: true,
  description: 'schemas.replyCommand.description',
  // 'Requiere de un comando de prefijo para ser activado:\n' +
  // '- `{{prefix}}reply on`, de la misma forma, off para desactivarla.\n' +
  // 'Este comando cuando este activo leerá todos los mensajes y al encontrar un alias ara una chanza.',
  command: CommandsNameEnum.ReplyCommand,
  category: CommandsCategoryEnum.DEV,
};

export { ReplyCommandSchema };
