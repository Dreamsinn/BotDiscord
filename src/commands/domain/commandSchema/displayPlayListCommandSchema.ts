import { discordEmojis } from '../discordEmojis';
import { CommandsNameEnum } from '../enums/commandNamesEnum';
import { CommandsCategoryEnum } from '../enums/commandsCategoryEnum';
import { CommandSchema } from '../interfaces/commandSchema';

const DisplayPlayListCommandSchema: CommandSchema = {
    name: 'Mostrar display',
    aliases: ['display', 'dp'],
    coolDown: 0,
    adminOnly: false,
    description:
        'Crea un hilo con el nombre de Displayer y envia un mensaje a dicho hilo.\n' +
        'En este mensaje se tienen disponibles casi todos los comandos de música mediante botones.\n' +
        'En caso que se quiera cerrar el display se puede usar **display kill**.\n' +
        `Para más información, en el ${discordEmojis.readme} del display.`,
    command: CommandsNameEnum.DisplayPlaylistCommand,
    category: CommandsCategoryEnum.MUSIC,
};

export { DisplayPlayListCommandSchema };
