import { CommandsNameEnum } from '../enums/commandNamesEnum';
import { CommandsCategoryEnum } from '../enums/commandsCategoryEnum';
import { CommandSchema } from '../interfaces/commandSchema';

const DisconnectCommandSchema: CommandSchema = {
  name: 'schemas.disconnectCommand.name',
  // 'Desconectar bot del canal de voz'
  aliases: ['dc', 'disconnect'],
  coolDown: 0,
  adminOnly: false,
  description: 'schemas.disconnectCommand.description',
  // 'Desconecta el bot del canal de voz.\n' +
  // 'Para que vuelva a sonar requerirá añadir una nueva canción o reconectar el bot mediante el comando `{{prefix}}join`.',
  command: CommandsNameEnum.DisconnectCommand,
  category: CommandsCategoryEnum.MUSIC,
};

export { DisconnectCommandSchema };
