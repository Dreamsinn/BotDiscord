import { CommandsCategoryEnum } from '../enums/commandsCategoryEnum';
import { CommandSchema } from '../interfaces/commandSchema';

const LogPlaylistStatusSchema: CommandSchema = {
    aliases: ['log', 'playliststatus', 'plstatus', 'pllog', 'playlistlog'],
    coolDown: 0,
    adminOnly: true,
    description: "Return a console log with discord's and playlist data.",
    category: CommandsCategoryEnum.PREFIX,
    name: 'PlayList Status Log',
};

export { LogPlaylistStatusSchema };
