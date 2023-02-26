import { CommandsNameEnum } from '../enums/commandNamesEnum';
import { CommandsCategoryEnum } from '../enums/commandsCategoryEnum';
import { CommandSchema } from '../interfaces/commandSchema';

const PlayListCommandSchema: CommandSchema = {
    name: 'Ver playList actual',
    aliases: ['playlist', 'pl'],
    coolDown: 0,
    adminOnly: false,
    description:
        'Muestra una lista paginada de todas las canciones, con su duracion, de la playlist que esta sonando.',
    command: CommandsNameEnum.PlaylistCommand,
    category: CommandsCategoryEnum.MUSIC,
};

export { PlayListCommandSchema };
