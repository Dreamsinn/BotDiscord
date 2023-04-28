import { CommandsNameEnum } from '../enums/commandNamesEnum';
import { CommandsCategoryEnum } from '../enums/commandsCategoryEnum';
import { CommandSchema } from '../interfaces/commandSchema';

const LoopPlayListModeCommandSchema: CommandSchema = {
    name: 'Loop playlist',
    aliases: ['loop'],
    coolDown: 0,
    adminOnly: false,
    description:
        'Este comando activa y desactiva el modo loop. Si está activo lo desactiva, y viceversa. \n' +
        'Cuando este activo la canción que acabe de sonar se pondrá la última de la playlist.',
    command: CommandsNameEnum.LoopPlaylistModeCommand,
    category: CommandsCategoryEnum.MUSIC,
};

export { LoopPlayListModeCommandSchema };
