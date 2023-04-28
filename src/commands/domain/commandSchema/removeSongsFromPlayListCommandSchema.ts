import { CommandsNameEnum } from '../enums/commandNamesEnum';
import { CommandsCategoryEnum } from '../enums/commandsCategoryEnum';
import { CommandSchema } from '../interfaces/commandSchema';

const RemoveSongsFromPlayListCommandSchema: CommandSchema = {
    name: 'Eliminar canciones de la playlist',
    aliases: ['rm', 'remove'],
    coolDown: 0,
    adminOnly: false,
    description:
        'Elimina n canciones de la playlist.\n' +
        'Al ejecutar el comando aparecerá una lista paginada de la playlist, y el bot leerá el siguiente mensaje.' +
        'Se deberá escribir el número de las canciones que se quieran borrar separadas por ",".\n\n' +
        'El bot solo leerá los mensajes bien escritos, es decir, mensajes con números más grandes que el número de canciones, con letras, etc, serán ignorados.\n' +
        'Ejemplo: 1, 6, 23\n\n' +
        '__Mientras este comando este en uso, no se podrán usar otros comandos. \nSe cerrará automáticamente tras 1min de inactividad.__',
    command: CommandsNameEnum.RemoveSongsFromPlaylistCommand,
    category: CommandsCategoryEnum.MUSIC,
};

export { RemoveSongsFromPlayListCommandSchema };
