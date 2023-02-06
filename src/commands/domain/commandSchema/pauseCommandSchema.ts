import { CommandsNameEnum } from '../enums/commandNamesEnum';
import { CommandsCategoryEnum } from '../enums/commandsCategoryEnum';
import { CommandSchema } from '../interfaces/commandSchema';

const PauseCommandSchema: CommandSchema = {
    name: 'Pausar canción',
    aliases: ['pause', 'stop'],
    coolDown: 0,
    adminOnly: false,
    description: 'Si esta sonando una cancion la parara, si esta parada la activara de nuevo.',
    command: CommandsNameEnum.PauseCommand,
    category: CommandsCategoryEnum.MUSIC,
};

export { PauseCommandSchema };
