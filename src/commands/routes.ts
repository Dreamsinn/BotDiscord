import { PlayListHandler } from './aplication/playListHandler';
import { DiceCommandToggler } from './aplication/prefixCommands/diceCommandToggler';
import { HelpCommand } from './aplication/prefixCommands/helpCommand';
import { ClearPlayListCommand } from './aplication/prefixCommands/musicCommands/ClearPlayListCommand';
import { DisconnectCommand } from './aplication/prefixCommands/musicCommands/disconnectCommand';
import { DisplayPlayListCommand } from './aplication/prefixCommands/musicCommands/displayPlayListCommand';
import { JoinChannelCommand } from './aplication/prefixCommands/musicCommands/JoinChannelCommand';
import { LoopPlayListModeCommand } from './aplication/prefixCommands/musicCommands/loopPlayListModeCommand';
import { PauseCommand } from './aplication/prefixCommands/musicCommands/pauseCommand';
import { PlayCommand } from './aplication/prefixCommands/musicCommands/playCommand';
import { PlayListCommand } from './aplication/prefixCommands/musicCommands/playListCommand';
import { RemoveSongsFromPlayListCommand } from './aplication/prefixCommands/musicCommands/removeSongsFromPlayListCommand';
import { ShufflePlayListCommand } from './aplication/prefixCommands/musicCommands/shufflePlayListCommand';
import { SkipMusicCommand } from './aplication/prefixCommands/musicCommands/SkipMusicCommand';
import { ReplyCommandToggler } from './aplication/prefixCommands/replyCommandToggler';
import { DisplayEmbedBuilder } from './aplication/utils/displayEmbedBuilder';
import { ClearPlayListCommandSchema } from './domain/commandSchema/clearPlayListCommandSchema';
import { DiceCommandTogglerSchema } from './domain/commandSchema/diceCommandTogglerSchema';
import { DisconnectCommandSchema } from './domain/commandSchema/disconnectCommandSchema';
import { DisplayPlayListCommandSchema } from './domain/commandSchema/displayPlayListCommandSchema';
import { HelpCommandSchema } from './domain/commandSchema/helpCommandSchema';
import { JoinChannelCommandSchema } from './domain/commandSchema/joinChannelCommandSchema';
import { LoopPlayListModeCommandSchema } from './domain/commandSchema/loopPlayListModeCommandSchema';
import { PauseCommandSchema } from './domain/commandSchema/pauseCommandSchema';
import { PlayCommandSchema } from './domain/commandSchema/playCommandSchema';
import { PlayListCommandSchema } from './domain/commandSchema/playListCommandSchema';
import { RemoveSongsFromPlayListCommandSchema } from './domain/commandSchema/removeSongsFromPlayListCommandSchema';
import { ReplyCommandTogglerSchema } from './domain/commandSchema/replyCommandTogglerSchema';
import { ShufflePlayListCommandSchema } from './domain/commandSchema/shufflePlayListCommandSchema';
import { SkipMusicCommandSchema } from './domain/commandSchema/skipMusicCommandSchema';
import { Command } from './domain/interfaces/Command';
import { PlayDlHandler } from './infrastructure/playDlHandler';
import { YoutubeAPIHandler } from './infrastructure/youtubeHandler';
import { LogPlaylistStatusSchema } from './domain/commandSchema/logPlaylistStatusSchema';
import { LogPlaylistStatusCommand } from './aplication/prefixCommands/musicCommands/logPlaylistStatusCommand';


export interface Route {
    alias: string[];
    command: Command;
}

const youtubeSearch = new YoutubeAPIHandler();
const playDlHandler = new PlayDlHandler();
const displayEmbedBuilder = new DisplayEmbedBuilder();
const playListHandler = new PlayListHandler(playDlHandler, displayEmbedBuilder);

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
    {
        alias: DisplayPlayListCommandSchema.aliases,
        command: new DisplayPlayListCommand(playListHandler),
    },
    {
        alias: DiceCommandTogglerSchema.aliases,
        command: new DiceCommandToggler(),
    },
    {
        alias: ReplyCommandTogglerSchema.aliases,
        command: new ReplyCommandToggler(),
    },
    {
        alias: LogPlaylistStatusSchema.aliases,
        command: new LogPlaylistStatusCommand(playListHandler),
    },
];
