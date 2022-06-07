import { CommandSchema } from '../interfaces/commandSchema';

const DiceCommandSchema: CommandSchema = {
    aliases: ['D'],
    coolDown: 120,
    devOnly: false,
    description: `cuando YDX o DX, siendo Y e X numeros, es escrito en el chat se lanzan Y dados de X caras, tambien permite tirar mas de un dado a la vez, separado por ", ".\n Ejemplo: 2D5, 4D3`,
    category: 'dice',
    name: 'dice',
    usage: ',',
    slash: {},
    contextChat: '',
    contextUser: '',
};

export { DiceCommandSchema };
