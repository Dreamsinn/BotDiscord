import { CommandsNameEnum } from '../enums/commandNamesEnum';
import { CommandsCategoryEnum } from '../enums/commandsCategoryEnum';
import { CommandSchema } from '../interfaces/commandSchema';

const ClearPlayListCommandSchema: CommandSchema = {
    name: 'Borrar playlist',
    aliases: ['c', 'clear'],
    coolDown: 0,
    adminOnly: false,
    description: `Borra todas las canciones de la lista.`,
    command: CommandsNameEnum.ClearPlaylistCommand,
    category: CommandsCategoryEnum.MUSIC,
};

export { ClearPlayListCommandSchema };
