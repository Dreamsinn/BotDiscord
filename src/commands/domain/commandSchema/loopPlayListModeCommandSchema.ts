import { CommandsCategoryEnum } from '../enums/commandsCategoryEnum';
import { CommandSchema } from '../interfaces/commandSchema';

const LoopPlayListModeCommandSchema: CommandSchema = {
    aliases: ['loop'],
    coolDown: 0,
    adminOnly: false,
    description:
        'Cuando este activo la canción que acabe de sonar se pondrá la última de la playlist\n' +
        'Si esta activo el comando lo desactiva, si esta desactivado, lo activa.',
    category: CommandsCategoryEnum.MUSIC,
    name: 'Loop playlist',
};

export { LoopPlayListModeCommandSchema };
