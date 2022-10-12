import { CommandsCategoryEnum } from '../enums/commandsCategoryEnum';
import { CommandSchema } from '../interfaces/commandSchema';

const PauseCommandSchema: CommandSchema = {
    aliases: ['pause', 'stop'],
    coolDown: 0,
    adminOnly: false,
    description: 'Si esta sonando una cancion la parara, si esta parada la activara de nuevo.',
    category: CommandsCategoryEnum.MUSIC,
    name: 'Pausar canción',
};

export { PauseCommandSchema };
