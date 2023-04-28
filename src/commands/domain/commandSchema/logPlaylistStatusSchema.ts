import { CommandsNameEnum } from '../enums/commandNamesEnum';
import { CommandsCategoryEnum } from '../enums/commandsCategoryEnum';
import { CommandSchema } from '../interfaces/commandSchema';

const LogPlaylistStatusSchema: CommandSchema = {
    name: 'PlayList Status Log',
    aliases: ['log'],
    coolDown: 0,
    adminOnly: true,
    description: "Return a console log with discord's and playlist data.",
    command: CommandsNameEnum.LogPlaylistStatusCommand,
    category: CommandsCategoryEnum.DEV,
};

export { LogPlaylistStatusSchema };
