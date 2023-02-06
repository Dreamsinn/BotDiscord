import { CommandsNameEnum } from '../enums/commandNamesEnum';
import { CommandsCategoryEnum } from '../enums/commandsCategoryEnum';
import { CommandSchema } from '../interfaces/commandSchema';

const DisconnectCommandSchema: CommandSchema = {
    name: 'Desconectar bot del canal de voz',
    aliases: ['dc', 'disconnect'],
    coolDown: 0,
    adminOnly: false,
    description:
        'Desconecta el bot del canal de voz.\n' +
        'Para que vuelva a sonar requerira añadir una nueva cancion o reconectar el bot mediante el comando join.',
    command: CommandsNameEnum.DisconnectCommand,
    category: CommandsCategoryEnum.MUSIC,
};

export { DisconnectCommandSchema };
