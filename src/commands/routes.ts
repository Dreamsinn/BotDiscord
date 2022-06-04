import { Command } from "./aplication/Command";
import { PlayCommand } from "./aplication/prefixCommands/musicCommands/playCommand";
import { PlayListCommand } from "./aplication/prefixCommands/musicCommands/playListCommand";
import { HelpCommand } from "./aplication/prefixCommands/helpCommand";
import { PlayCommandSchema } from "./domain/commandSchema/playCommandSchema";
import { PlayListCommandSchema } from "./domain/commandSchema/playListCommandSchema";
import { HelpCommandSchema } from "./domain/commandSchema/helpCommandSchema";
import { YoutubeAPIHandler } from "./infrastructure/youtubeHandler"
import { PlayDlHandler } from "./infrastructure/playDlHandler"
import { PlayListHandler } from "./aplication/playListHandler"
import { PauseCommandSchema } from "./domain/commandSchema/PauseCommandSchema";
import { PauseCommand } from "./aplication/prefixCommands/musicCommands/pauseCommand";
import { UnpauseCommandSchema } from "./domain/commandSchema/UnpauseCommandSchema";
import { UnpauseCommand } from "./aplication/prefixCommands/musicCommands/UnpauseCommand";
import { SkipMusicCommandSchema } from "./domain/commandSchema/SkipMusicCommandSchema";
import { SkipMusicCommand } from "./aplication/prefixCommands/musicCommands/SkipMusicCommand";
import { DisconnectCommandSchema } from "./domain/commandSchema/DisconnectCommandSchema";
import { DisconnectCommand } from "./aplication/prefixCommands/musicCommands/disconnectCommand";
import { JoinChannelCommandSchema } from "./domain/commandSchema/joinChannelCommandSchema";
import { JoinChannelCommand } from "./aplication/prefixCommands/musicCommands/JoinChannelCommand";
import { ClearPlayListCommandSchema } from "./domain/commandSchema/clearPlayListCommandSchema";
import { ClearPlayListCommand } from "./aplication/prefixCommands/musicCommands/ClearPlayListCommand";
import { RemoveSongsFromPlayListCommandSchema } from "./domain/commandSchema/removeSongsFromPlayListCommandSchema";
import { RemoveSongsFromPlayListCommand } from "./aplication/prefixCommands/musicCommands/removeSongsFromPlayListCommand";

export interface Route {
    alias: string[],
    command: Command;
}

const youtubeSearch = new YoutubeAPIHandler();
const playDlHandler = new PlayDlHandler();
const playListHandler = new PlayListHandler(playDlHandler);

// se podria tambien un switch
export const routes: Route[] = [
    {
        alias: PlayCommandSchema.aliases,
        command: new PlayCommand(youtubeSearch, playListHandler, playDlHandler),
    },
    {
        alias: PlayListCommandSchema.aliases,
        command: new PlayListCommand(playListHandler),
    },
    {
        alias: HelpCommandSchema.aliases,
        command: new HelpCommand(),
    },
    {
        alias: UnpauseCommandSchema.aliases,
        command: new UnpauseCommand(playListHandler),
    },
    {
        alias: PauseCommandSchema.aliases,
        command: new PauseCommand(playListHandler),
    },
    {
        alias: SkipMusicCommandSchema.aliases,
        command: new SkipMusicCommand(playListHandler),
    },
    {
        alias: DisconnectCommandSchema.aliases,
        command: new DisconnectCommand(playListHandler),
    },
    {
        alias: JoinChannelCommandSchema.aliases,
        command: new JoinChannelCommand(playListHandler),
    },
    {
        alias: ClearPlayListCommandSchema.aliases,
        command: new ClearPlayListCommand(playListHandler),
    },
    {
        alias: RemoveSongsFromPlayListCommandSchema.aliases,
        command: new RemoveSongsFromPlayListCommand(playListHandler),
    }
]
