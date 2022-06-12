import { CommandSchema } from '../interfaces/commandSchema';

const DiceCommandSchema: CommandSchema = {
    aliases: ['D'],
    coolDown: 120,
    devOnly: false,
    description:
        `\`${process.env.PREFIX}roll on\` o \`${process.env.PREFIX}dice on\` para activar esta función, de la misma forma, off para desactivarla.` +
        'Usos: \n' +
        '- Tirar dados: escribir en el chat YDX o DX, siendo Y e X números, lanza Y dados de X caras. También  permite tirar más  de un dado a la vez, separado por ",".\n Ejemplo: 2D5, 4D3' +
        '- Número de aciertos: se puede añadir a una tirada < o <= o > o >= y un número, para ver el número de aciertos de dicha tirada. No permite más de una tirada a la vez.\n Ejemplo: 4D6 > 3',
    category: 'dice',
    name: 'dice',
};

export { DiceCommandSchema };
