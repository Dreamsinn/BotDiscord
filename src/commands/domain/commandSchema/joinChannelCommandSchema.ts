import { CommandsCategoryEnum } from '../enums/commandsCategoryEnum';
import { CommandSchema } from '../interfaces/commandSchema';

const JoinChannelCommandSchema: CommandSchema = {
    aliases: ['j', 'join'],
    coolDown: 0,
    adminOnly: false,
    description: 'Conecta el bot al canal de voz del usuario, requiere estar en un canal de voz',
    category: CommandsCategoryEnum.MUSIC,
    name: 'Conectar bot al canal de voz',
};

export { JoinChannelCommandSchema };
