import { CommandsCategoryEnum } from '../enums/commandsCategoryEnum';
import { CommandSchema } from '../interfaces/commandSchema';

const UnpauseCommandSchema: CommandSchema = {
    aliases: ['unpause', 'resume'],
    coolDown: 0,
    devOnly: false,
    description: 'Si el comando de Pausar ha sido usado, reanuda la canción.',
    category: CommandsCategoryEnum.MUSIC,
    name: 'Reanudar',
};

export { UnpauseCommandSchema };
