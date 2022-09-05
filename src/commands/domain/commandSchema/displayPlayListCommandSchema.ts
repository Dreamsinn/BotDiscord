import { CommandsCategoryEnum } from '../enums/commandsCategoryEnum';
import { discordEmojis } from '../discordEmojis';
import { CommandSchema } from '../interfaces/commandSchema';

const DisplayPlayListCommandSchema: CommandSchema = {
    aliases: ['display', 'dp'],
    coolDown: 0,
    devOnly: false,
    description:
        'Envía un mensaje al canal de voz que muestra toda la información de la playlist.\n' +
        'En este mensaje se tienen disponibles casi todos los comandos de música mediante emojis.\n' +
        `Para más información, en el ${discordEmojis.readme} del display.`,
    category: CommandsCategoryEnum.MUSIC,
    name: 'Mostrar display',
};

export { DisplayPlayListCommandSchema };
