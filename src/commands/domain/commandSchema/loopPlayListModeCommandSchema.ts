import { CommandsNameEnum } from '../enums/commandNamesEnum';
import { CommandsCategoryEnum } from '../enums/commandsCategoryEnum';
import { CommandSchema } from '../interfaces/commandSchema';

const LoopPlayListModeCommandSchema: CommandSchema = {
    name: 'Loop playlist',
    aliases: ['loop'],
    coolDown: 0,
    adminOnly: false,
    description:
        'Cuando este activo la canción que acabe de sonar se pondrá la última de la playlist\n' +
        'Si esta activo el comando lo desactiva, si esta desactivado, lo activa.',
    command: CommandsNameEnum.LoopPlaylistModeCommand,
    category: CommandsCategoryEnum.MUSIC,
};

export { LoopPlayListModeCommandSchema };
