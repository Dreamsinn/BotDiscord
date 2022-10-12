import { CommandsCategoryEnum } from '../enums/commandsCategoryEnum';
import { CommandSchema } from '../interfaces/commandSchema';

const SkipMusicCommandSchema: CommandSchema = {
    aliases: ['skip', 's'],
    coolDown: 0,
    devOnly: false,
    description: 'Pasa la canción que esté sonando.',
    category: CommandsCategoryEnum.MUSIC,
    name: 'Pasar musica',
};

export { SkipMusicCommandSchema };
