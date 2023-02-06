import { CommandsNameEnum } from '../enums/commandNamesEnum';
import { CommandsCategoryEnum } from '../enums/commandsCategoryEnum';
import { CommandSchema } from '../interfaces/commandSchema';

const PlayListCommandSchema: CommandSchema = {
    name: 'PlayList',
    aliases: ['playlist', 'pl'],
    coolDown: 0,
    adminOnly: false,
    description: 'Muestra una lista paginada de todas las canciones de la playlist con su duracion.',
    command: CommandsNameEnum.PlaylistCommand,
    category: CommandsCategoryEnum.MUSIC,
};

export { PlayListCommandSchema };
