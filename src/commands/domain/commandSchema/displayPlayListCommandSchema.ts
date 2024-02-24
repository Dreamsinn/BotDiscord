import { CommandsNameEnum } from '../enums/commandNamesEnum';
import { CommandsCategoryEnum } from '../enums/commandsCategoryEnum';
import { CommandSchema } from '../interfaces/commandSchema';

const DisplayPlayListCommandSchema: CommandSchema = {
  name: 'schemas.displayerCommand.name',
  // Mostrar display
  aliases: ['display', 'dp'],
  coolDown: 0,
  adminOnly: false,
  description: 'schemas.displayerCommand.description',
  // 'Crea un hilo con el nombre de Displayer y envía un mensaje a dicho hilo.\n' +
  // 'En este mensaje se tienen disponibles casi todos los comandos de música mediante botones.\n' +
  // 'En caso de que se quiera cerrar el display se puede usar `{{prefix}}display kill`.\n' +
  // 'Solo puede haber un displayer abierto por servidor. \n' +
  // 'Para más información, en el botón **README** del display.',
  command: CommandsNameEnum.DisplayPlaylistCommand,
  category: CommandsCategoryEnum.MUSIC,
};

export { DisplayPlayListCommandSchema };
