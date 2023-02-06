import { CommandsNameEnum } from '../enums/commandNamesEnum';
import { CommandsCategoryEnum } from '../enums/commandsCategoryEnum';
import { CommandSchema } from '../interfaces/commandSchema';

const SkipMusicCommandSchema: CommandSchema = {
    name: 'Pasar musica',
    aliases: ['skip', 's'],
    coolDown: 0,
    adminOnly: false,
    description: 'Pasa la canción que esté sonando.',
    command: CommandsNameEnum.SkipMusicCommand,
    category: CommandsCategoryEnum.MUSIC,
};

export { SkipMusicCommandSchema };
