import { CommandsCategoryEnum } from '../enums/commandsCategoryEnum';
import { CommandSchema } from '../interfaces/commandSchema';

const ClearPlayListCommandSchema: CommandSchema = {
    aliases: ['c', 'clear'],
    coolDown: 0,
    devOnly: false,
    description: `Borra todas las canciones de la lista, excepto la que esté sonando`,
    category: CommandsCategoryEnum.MUSIC,
    name: 'Borrar playlist',
};

export { ClearPlayListCommandSchema };
