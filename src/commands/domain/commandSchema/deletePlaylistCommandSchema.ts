import { CommandsNameEnum } from '../enums/commandNamesEnum';
import { CommandsCategoryEnum } from '../enums/commandsCategoryEnum';
import { CommandSchema } from '../interfaces/commandSchema';

export const DeletePlaylistCommandSchema: CommandSchema = {
    name: 'Eliminar playlist',
    aliases: ['deletepl', 'deleteplaylist'],
    coolDown: 0,
    adminOnly: false,
    description:
        'Este comando permite eliminar una playlist creada por uno mismo o del servidor.\n' +
        'Para eliminar una playlist del servidor hay que añadir  ``` guild``` al comando. Se requiere obligatoriamente tener admin role.\n' +
        '__Durante este proceso no se podrán usar otros comandos.__',
    command: CommandsNameEnum.DeletePlaylistCommand,
    category: CommandsCategoryEnum.MUSIC,
};
