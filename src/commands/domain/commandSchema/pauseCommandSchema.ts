import { CommandsNameEnum } from '../enums/commandNamesEnum';
import { CommandsCategoryEnum } from '../enums/commandsCategoryEnum';
import { CommandSchema } from '../interfaces/commandSchema';

const PauseCommandSchema: CommandSchema = {
    name: 'schemas.pauseCommand.name',
    // Pausar canción
    aliases: ['pause', 'stop'],
    coolDown: 0,
    adminOnly: false,
    description: 'schemas.pauseCommand.description',
    // 'Si está sonando lo parara, si está parado lo activara de nuevo.',
    command: CommandsNameEnum.PauseCommand,
    category: CommandsCategoryEnum.MUSIC,
};

export { PauseCommandSchema };
