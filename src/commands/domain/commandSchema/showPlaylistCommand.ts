import { CommandsNameEnum } from '../enums/commandNamesEnum';
import { CommandsCategoryEnum } from '../enums/commandsCategoryEnum';
import { CommandSchema } from '../interfaces/commandSchema';

const ShowPlaylistCommandSchema: CommandSchema = {
    name: 'Ver playList guardads en la base de datos',
    aliases: ['showpl', 'showplaylist'],
    coolDown: 0,
    adminOnly: false,
    description:
        'Este comando permite ver las playlist creadas por uno mismo o las del servidor.\n' +
        'Para ver una playlist del servidor hay que añadir  ``` guild``` al comando. Se requiere obligatoriamente tener admin role.\n' +
        '__Durante este proceso no se podrán usar otros comandos.__',
    command: CommandsNameEnum.ShowPlayListCommand,
    category: CommandsCategoryEnum.MUSIC,
};

export { ShowPlaylistCommandSchema };
