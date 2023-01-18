import { PlayListHandler } from './aplication/playListHandler';
import { DiceCommandToggler } from './aplication/prefixCommands/diceCommandToggler';
import { HelpCommand } from './aplication/prefixCommands/helpCommand';
import { ClearPlayListCommand } from './aplication/prefixCommands/musicCommands/ClearPlayListCommand';
import { DisconnectCommand } from './aplication/prefixCommands/musicCommands/disconnectCommand';
import { DisplayPlayListCommand } from './aplication/prefixCommands/musicCommands/displayPlayListCommand';
import { JoinChannelCommand } from './aplication/prefixCommands/musicCommands/JoinChannelCommand';
import { LogPlaylistStatusCommand } from './aplication/prefixCommands/musicCommands/logPlaylistStatusCommand';
import { LoopPlayListModeCommand } from './aplication/prefixCommands/musicCommands/loopPlayListModeCommand';
import { PauseCommand } from './aplication/prefixCommands/musicCommands/pauseCommand';
import { PlayCommandHandler } from './aplication/prefixCommands/musicCommands/playCommand/playCommandHandler';
import { PlayMusicByName } from './aplication/prefixCommands/musicCommands/playCommand/playMusicByName';
import { PlayMusicByYouTubeMobileURL } from './aplication/prefixCommands/musicCommands/playCommand/playMusicByYouTubeMobileURL';
import { PlayMusicByYouTubeURL } from './aplication/prefixCommands/musicCommands/playCommand/playMusicByYouTubeURL';
import { PlayPlayListByYoutubeURL } from './aplication/prefixCommands/musicCommands/playCommand/playPlayListByYoutubeURL';
import { PlayListCommand } from './aplication/prefixCommands/musicCommands/playListCommand';
import { RemoveSongsFromPlayListCommand } from './aplication/prefixCommands/musicCommands/removeSongsFromPlayListCommand';
import { ShufflePlayListCommand } from './aplication/prefixCommands/musicCommands/shufflePlayListCommand';
import { SkipMusicCommand } from './aplication/prefixCommands/musicCommands/SkipMusicCommand';
import { ReplyCommandToggler } from './aplication/prefixCommands/replyCommandToggler';
import { DisplayEmbedBuilder } from './aplication/utils/displayEmbedBuilder';
import { UsersUsingACommand } from './aplication/utils/usersUsingACommand';
import { ClearPlayListCommandSchema } from './domain/commandSchema/clearPlayListCommandSchema';
import { DiceCommandTogglerSchema } from './domain/commandSchema/diceCommandTogglerSchema';
import { DisconnectCommandSchema } from './domain/commandSchema/disconnectCommandSchema';
import { DisplayPlayListCommandSchema } from './domain/commandSchema/displayPlayListCommandSchema';
import { HelpCommandSchema } from './domain/commandSchema/helpCommandSchema';
import { JoinChannelCommandSchema } from './domain/commandSchema/joinChannelCommandSchema';
import { LogPlaylistStatusSchema } from './domain/commandSchema/logPlaylistStatusSchema';
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
interface Route {
    alias: string[];
    command: Command;
}

export class Routes {
    private musicAPIs = {
        youtubeAPI: new YoutubeAPIHandler(),
        playDlAPI: new PlayDlHandler(),
    };
    private displayEmbedBuilder = new DisplayEmbedBuilder();
    private playListHandler = new PlayListHandler(this.musicAPIs.playDlAPI, this.displayEmbedBuilder);
    private playMusicByName = new PlayMusicByName(this.musicAPIs, this.usersUsingACommand);
    private playMusicByYouTubeMobileURL = new PlayMusicByYouTubeMobileURL(this.musicAPIs);
    private playPlayListByYoutubeURL = new PlayPlayListByYoutubeURL(
        this.musicAPIs,
        this.usersUsingACommand,
    );
    private playMusicByYouTubeURL = new PlayMusicByYouTubeURL(this.musicAPIs);

    constructor(private usersUsingACommand: UsersUsingACommand) {}

    public routeList: Route[] = [
        {
            alias: PlayCommandSchema.aliases,
            command: new PlayCommandHandler(
                this.playListHandler,
                this.playMusicByName,
                this.playMusicByYouTubeMobileURL,
                this.playPlayListByYoutubeURL,
                this.playMusicByYouTubeURL,
            ),
        },
        {
            alias: PlayListCommandSchema.aliases,
            command: new PlayListCommand(this.playListHandler),
        },
        {
            alias: HelpCommandSchema.aliases,
            command: new HelpCommand(this.usersUsingACommand),
        },
        {
            alias: PauseCommandSchema.aliases,
            command: new PauseCommand(this.playListHandler),
        },
        {
            alias: SkipMusicCommandSchema.aliases,
            command: new SkipMusicCommand(this.playListHandler),
        },
        {
            alias: DisconnectCommandSchema.aliases,
            command: new DisconnectCommand(this.playListHandler),
        },
        {
            alias: JoinChannelCommandSchema.aliases,
            command: new JoinChannelCommand(this.playListHandler),
        },
        {
            alias: ClearPlayListCommandSchema.aliases,
            command: new ClearPlayListCommand(this.playListHandler),
        },
        {
            alias: RemoveSongsFromPlayListCommandSchema.aliases,
            command: new RemoveSongsFromPlayListCommand(this.playListHandler, this.usersUsingACommand),
        },
        {
            alias: ShufflePlayListCommandSchema.aliases,
            command: new ShufflePlayListCommand(this.playListHandler),
        },
        {
            alias: LoopPlayListModeCommandSchema.aliases,
            command: new LoopPlayListModeCommand(this.playListHandler),
        },
        {
            alias: DisplayPlayListCommandSchema.aliases,
            command: new DisplayPlayListCommand(this.playListHandler),
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
            command: new LogPlaylistStatusCommand(this.playListHandler),
        },
    ];
}
