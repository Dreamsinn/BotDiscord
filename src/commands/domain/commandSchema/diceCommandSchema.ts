import { CommandsNameEnum } from '../enums/commandNamesEnum';
import { CommandsCategoryEnum } from '../enums/commandsCategoryEnum';
import { CommandSchema } from '../interfaces/commandSchema';

const DiceCommandSchema: CommandSchema = {
    name: 'Commando de dados',
    aliases: ['D'],
    coolDown: 120,
    adminOnly: false,
    description:
        '**Requiere de un comando de prefijo previo para ser activado:**\n' +
        `- \`{{prefix}}roll on\` o \`{{prefix}}dice on\`, de la misma forma, off para desactivarla.\n\n` +
        'Usos: \n' +
        '- Tirar dados: escribir en el chat YDX o DX, siendo Y e X números, lanza Y dados de X caras. También permite tirar más  de un dado a la vez, separado por ",".\n Ejemplo: 2D5, 4D3 \n\n' +
        '- Número de aciertos: se puede añadir a una tirada < o <= o > o >= y un número, para ver el número de aciertos de dicha tirada. No permite más de una tirada a la vez.\n Ejemplo: 4D6 > 3.',
    command: CommandsNameEnum.DiceCommand,
    category: CommandsCategoryEnum.NONPREFIX,
};

export { DiceCommandSchema };
