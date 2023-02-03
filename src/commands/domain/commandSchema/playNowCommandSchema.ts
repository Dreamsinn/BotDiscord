import { CommandsCategoryEnum } from '../enums/commandsCategoryEnum';
import { CommandSchema } from '../interfaces/commandSchema';

const PlayNowCommandSchema: CommandSchema = {
    aliases: ['playnow', 'first'],
    coolDown: 0,
    adminOnly: false,
    description:
        'Cambia la primera cancion de la playlist.\n' +
        'Al ejecutar el comando aparecerá una lista paginada de la playlist, y el bot leerá el siguiente mensaje.' +
        'Se deberá escribir el número de la cancione que se quiera que suena',
    category: CommandsCategoryEnum.MUSIC,
    name: 'Cambiar la cancion que esta sonando',
};

export { PlayNowCommandSchema };
