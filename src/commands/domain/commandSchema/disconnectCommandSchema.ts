import { CommandsCategoryEnum } from '../enums/commandsCategoryEnum';
import { CommandSchema } from '../interfaces/commandSchema';

const DisconnectCommandSchema: CommandSchema = {
    aliases: ['dc', 'disconnect'],
    coolDown: 0,
    adminOnly: false,
    description:
        'Desconecta el bot del canal de voz.\n' +
        'Para que vuelva a sonar requerira añadir una nueva cancion o reconectar el bot mediante el comando join.',
    category: CommandsCategoryEnum.MUSIC,
    name: 'Desconectar bot del canal de voz',
};

export { DisconnectCommandSchema };
