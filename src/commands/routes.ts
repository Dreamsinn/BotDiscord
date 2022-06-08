import { PlayListHandler } from './aplication/playListHandler';
import { HelpCommand } from './aplication/prefixCommands/helpCommand';
import { ClearPlayListCommand } from './aplication/prefixCommands/musicCommands/ClearPlayListCommand';
import { DisconnectCommand } from './aplication/prefixCommands/musicCommands/disconnectCommand';
import { JoinChannelCommand } from './aplication/prefixCommands/musicCommands/JoinChannelCommand';
import { LoopPlayListModeCommand } from './aplication/prefixCommands/musicCommands/loopPlayListModeCommand';
import { PauseCommand } from './aplication/prefixCommands/musicCommands/pauseCommand';
import { PlayCommand } from './aplication/prefixCommands/musicCommands/playCommand';
import { PlayListCommand } from './aplication/prefixCommands/musicCommands/playListCommand';
import { RemoveSongsFromPlayListCommand } from './aplication/prefixCommands/musicCommands/removeSongsFromPlayListCommand';
import { ShufflePlayListCommand } from './aplication/prefixCommands/musicCommands/shufflePlayListCommand';
import { SkipMusicCommand } from './aplication/prefixCommands/musicCommands/SkipMusicCommand';
import { UnpauseCommand } from './aplication/prefixCommands/musicCommands/UnpauseCommand';
import { ClearPlayListCommandSchema } from './domain/commandSchema/clearPlayListCommandSchema';
import { DisconnectCommandSchema } from './domain/commandSchema/DisconnectCommandSchema';
import { HelpCommandSchema } from './domain/commandSchema/helpCommandSchema';
import { JoinChannelCommandSchema } from './domain/commandSchema/joinChannelCommandSchema';
import { LoopPlayListModeCommandSchema } from './domain/commandSchema/loopPlayListModeCommandSchema';
import { PauseCommandSchema } from './domain/commandSchema/PauseCommandSchema';
import { PlayCommandSchema } from './domain/commandSchema/playCommandSchema';
import { PlayListCommandSchema } from './domain/commandSchema/playListCommandSchema';
import { RemoveSongsFromPlayListCommandSchema } from './domain/commandSchema/removeSongsFromPlayListCommandSchema';
import { ShufflePlayListCommandSchema } from './domain/commandSchema/shufflePlayListCommandSchema';
import { SkipMusicCommandSchema } from './domain/commandSchema/SkipMusicCommandSchema';
import { UnpauseCommandSchema } from './domain/commandSchema/UnpauseCommandSchema';
import { Command } from './domain/interfaces/Command';
import { PlayDlHandler } from './infrastructure/playDlHandler';
import { YoutubeAPIHandler } from './infrastructure/youtubeHandler';

export interface Route {
    alias: string[];
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
    },
    {
        alias: ShufflePlayListCommandSchema.aliases,
        command: new ShufflePlayListCommand(playListHandler),
    },
    {
        alias: LoopPlayListModeCommandSchema.aliases,
        command: new LoopPlayListModeCommand(playListHandler),
    },
];
