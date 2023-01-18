import { CommandsCategoryEnum } from '../enums/commandsCategoryEnum';
import { CommandSchema } from '../interfaces/commandSchema';

const PlayListCommandSchema: CommandSchema = {
    aliases: ['playlist', 'pl'],
    coolDown: 0,
    devOnly: false,
    description: 'Muestra una lista paginada de todas las canciones de la playlist con su duracion.',
    category: CommandsCategoryEnum.MUSIC,
    name: 'PlayList',
};

export { PlayListCommandSchema };
