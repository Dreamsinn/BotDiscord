import { CommandsNameEnum } from '../enums/commandNamesEnum';
import { CommandsCategoryEnum } from '../enums/commandsCategoryEnum';
import { CommandSchema } from '../interfaces/commandSchema';

const JoinChannelCommandSchema: CommandSchema = {
    name: 'Conectar bot al canal de voz',
    aliases: ['j', 'join'],
    coolDown: 0,
    adminOnly: false,
    description:
        'Conecta el bot al canal de voz en el que se encuentra el usuario, **requiere estar en un canal de voz.**',
    command: CommandsNameEnum.JoinChannelCommand,
    category: CommandsCategoryEnum.MUSIC,
};

export { JoinChannelCommandSchema };
