import { CommandsCategoryEnum } from '../commandsCategoryEnum';
import { CommandSchema } from '../interfaces/commandSchema';

const PlayCommandSchema: CommandSchema = {
    aliases: ['p', 'play'],
    coolDown: 0,
    devOnly: false,
    description:
        'Este comando debe ir seguido de la canción que se quiere escuchar, hay que tener en cuenta que de momento solo coge la música de YouTube.\n\u200b\n' +
        'Se le puede pasar como argumento:\n' +
        '-**Nombre de la cancion**: se puede buscar como si se estuviera buscando en la misma plataforma y elegir una de las primeras 9 opciones.\n' +
        '>  >__Durante este proceso no se podrán usar otros comandos.__\n\u200b\n' +
        '-**Url de la canción**: la url de la canción de YouTube.\n\u200b\n' +
        '-**Url playlist**: la url de la playlist de YouTube. En esta búsqueda hay que tener en cuenta:\n' +
        '>  >Si se estaba escuchando una canción de la playlist se preguntara si se desea escuchar la canción o la playlist.\n' +
        '>  >En el caso anterior, si se falla a conseguir la información de la playlist sonará la canción del enlace.\n' +
        ">  >Las 'mix' de YouTube pueden fallar, por temas propios de YouTube.\n" +
        '>  >Si la API principal falla, y se debe buscar por la propia de YouTube, tardará unos segundo, y como máximo cojera las 30 primeras canciones de la playlist.',
    category: CommandsCategoryEnum.MUSIC,
    name: 'Play',
};

export { PlayCommandSchema };
