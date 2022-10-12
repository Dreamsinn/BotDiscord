import { CommandsCategoryEnum } from '../enums/commandsCategoryEnum';
import { CommandSchema } from '../interfaces/commandSchema';

const RemoveSongsFromPlayListCommandSchema: CommandSchema = {
    aliases: ['rm', 'remove'],
    coolDown: 0,
    adminOnly: false,
    description:
        'Elimina n canciones de la playlist.\n' +
        'Al ejecutar el comando aparecerá una lista paginada de la playlist, y el bot leerá el siguiente mensaje.' +
        'En este se deberá escribir el número de las canciones que se quieran borrar separadas por ",".\n' +
        'El bot solo leerá los mensajes bien escritos, es decir, mensajes con números más grandes de lo que toca, con letras, etc, serán ignorados.\n' +
        'Ejemplo: 1, 6, 23\n' +
        '__Durante este proceso no se podrán usar otros comandos.__',
    category: CommandsCategoryEnum.MUSIC,
    name: 'Eliminar canciones de la playlist',
};

export { RemoveSongsFromPlayListCommandSchema };
