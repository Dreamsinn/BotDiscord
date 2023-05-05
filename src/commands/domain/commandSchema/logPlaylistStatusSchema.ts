import { CommandsNameEnum } from '../enums/commandNamesEnum';
import { CommandsCategoryEnum } from '../enums/commandsCategoryEnum';
import { CommandSchema } from '../interfaces/commandSchema';

const LogPlaylistStatusSchema: CommandSchema = {
    name: 'schemas.logCommand.name',
    // PlayList Status Log
    aliases: ['log'],
    coolDown: 0,
    adminOnly: true,
    description: 'schemas.logCommand.description',
    // "Return a console log with discord's and playlist data.",
    command: CommandsNameEnum.LogPlaylistStatusCommand,
    category: CommandsCategoryEnum.DEV,
};

export { LogPlaylistStatusSchema };
