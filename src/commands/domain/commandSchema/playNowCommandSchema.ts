import { CommandsNameEnum } from '../enums/commandNamesEnum';
import { CommandsCategoryEnum } from '../enums/commandsCategoryEnum';
import { CommandSchema } from '../interfaces/commandSchema';

const PlayNowCommandSchema: CommandSchema = {
    name: 'Cambiar la canción que está sonando',
    aliases: ['playnow', 'first'],
    coolDown: 0,
    adminOnly: false,
    description:
        'Cambia la primera canción de la playlist.\n' +
        'Al ejecutar el comando aparecerá una lista paginada de la playlist, y el bot leerá el siguiente mensaje.\n' +
        'Se deberá escribir el número de la canciones que se quiera que suena.\n\n' +
        '__Mientras este comando este en uso, no se podrán usar otros comandos. \nSe cerrará automáticamente tras 1min de inactividad.__',
    command: CommandsNameEnum.PlayNowCommand,
    category: CommandsCategoryEnum.MUSIC,
};

export { PlayNowCommandSchema };
