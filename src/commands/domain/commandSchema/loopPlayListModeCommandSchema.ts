import { CommandsCategoryEnum } from '../commandsCategoryEnum';
import { CommandSchema } from '../interfaces/commandSchema';

const LoopPlayListModeCommandSchema: CommandSchema = {
    aliases: ['loop'],
    coolDown: 0,
    devOnly: false,
    description:
        'Este comando debe ir seguido de `on` u `off` para activar o desactivar el modo loop\n' +
        'Cuando este activo la canción que acabe de sonar se pondrá la última de la playlist\n' +
        `Ejemplo: ${process.env.PREFIX}loop on`,
    category: CommandsCategoryEnum.MUSIC,
    name: 'Loop playlist',
};

export { LoopPlayListModeCommandSchema };
