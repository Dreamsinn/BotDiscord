import { CommandsNameEnum } from '../enums/commandNamesEnum';
import { CommandsCategoryEnum } from '../enums/commandsCategoryEnum';
import { CommandSchema } from '../interfaces/commandSchema';

const PlayCommandSchema: CommandSchema = {
  name: 'schemas.playCommand.name',
  // Play
  aliases: ['p', 'play'],
  coolDown: 0,
  adminOnly: false,
  description: 'schemas.playCommand.description',
  // 'Este comando debe ir seguido de la canción que se quiere escuchar.\n' +
  // 'Se lae puede pasar como argumento:\n\u200b\n' +
  // '-**Nombre de la cancion**: se puede buscar como si se estuviera buscando en la misma plataforma y elegir una de las primeras 9 opciones.\n' +
  // '>  > __Durante este proceso no se podrán usar otros comandos.__\n\u200b\n' +
  // '-**Url de la canción de Youtube**: tanto de móvil como de pc.\n\u200b\n' +
  // '-**Url playlist de Youtube**: En esta búsqueda hay que tener en cuenta:\n' +
  // '>  > Si se estaba escuchando una canción de la playlist se preguntara si se desea escuchar la canción o la playlist.\n' +
  // '>  > En el caso anterior, si se falla a conseguir la información de la playlist sonará la canción del enlace.\n' +
  // ">  > Los 'Mix' que hace youtube en funcion de gustos personales muchas veces dan error. \n\u200b\n" +
  // '-**Url de la canción de Spotify**.\n\u200b\n' +
  // '-**Url playlist de Spotify**.\n',
  command: CommandsNameEnum.PlayCommand,
  category: CommandsCategoryEnum.MUSIC,
};

export { PlayCommandSchema };
