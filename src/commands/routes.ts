import { PlayListHandler } from './aplication/playListHandler';
import { DiceCommandToggler } from './aplication/prefixCommands/diceCommandToggler';
import { HelpCommand } from './aplication/prefixCommands/helpCommand';
import { ClearPlayListCommand } from './aplication/prefixCommands/musicCommands/clearPlayListCommand';
import { DisconnectCommand } from './aplication/prefixCommands/musicCommands/disconnectCommand';
import { DisplayPlayListCommand } from './aplication/prefixCommands/musicCommands/displayPlayListCommand';
import { JoinChannelCommand } from './aplication/prefixCommands/musicCommands/joinChannelCommand';
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
import { SkipMusicCommand } from './aplication/prefixCommands/musicCommands/skipMusicCommand';
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
import { PlayDlService } from './infrastructure/playDlService';
import { YouTubeAPIService } from './infrastructure/youTubeAPIService';

interface Route {
    name: string;
    alias: string[];
    command: Command;
}

export class Routes {
    private musicAPIs = {
        youtubeAPI: new YouTubeAPIService(),
        playDlAPI: new PlayDlService(),
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
            name: 'Play Command',
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
            name: 'PlayList Command',
            alias: PlayListCommandSchema.aliases,
            command: new PlayListCommand(this.playListHandler),
        },
        {
            name: 'Help Command',
            alias: HelpCommandSchema.aliases,
            command: new HelpCommand(this.usersUsingACommand),
        },
        {
            name: 'Pause Command',
            alias: PauseCommandSchema.aliases,
            command: new PauseCommand(this.playListHandler),
        },
        {
            name: 'Skip Music Command',
            alias: SkipMusicCommandSchema.aliases,
            command: new SkipMusicCommand(this.playListHandler),
        },
        {
            name: 'Disconnect Command',
            alias: DisconnectCommandSchema.aliases,
            command: new DisconnectCommand(this.playListHandler),
        },
        {
            name: 'Join Channel Command',
            alias: JoinChannelCommandSchema.aliases,
            command: new JoinChannelCommand(this.playListHandler),
        },
        {
            name: 'Clear PlayList Command',
            alias: ClearPlayListCommandSchema.aliases,
            command: new ClearPlayListCommand(this.playListHandler),
        },
        {
            name: 'Remove Songs From Playlist Command',
            alias: RemoveSongsFromPlayListCommandSchema.aliases,
            command: new RemoveSongsFromPlayListCommand(this.playListHandler, this.usersUsingACommand),
        },
        {
            name: 'Shuffle Playlist Command',
            alias: ShufflePlayListCommandSchema.aliases,
            command: new ShufflePlayListCommand(this.playListHandler),
        },
        {
            name: 'Loop Playlist Mode Command',
            alias: LoopPlayListModeCommandSchema.aliases,
            command: new LoopPlayListModeCommand(this.playListHandler),
        },
        {
            name: 'Display Playlist Command',
            alias: DisplayPlayListCommandSchema.aliases,
            command: new DisplayPlayListCommand(this.playListHandler),
        },
        {
            name: 'Dice Command Toggler',
            alias: DiceCommandTogglerSchema.aliases,
            command: new DiceCommandToggler(),
        },
        {
            name: 'Reply Command Toggler',
            alias: ReplyCommandTogglerSchema.aliases,
            command: new ReplyCommandToggler(),
        },
        {
            name: 'Log Playlist Status Command',
            alias: LogPlaylistStatusSchema.aliases,
            command: new LogPlaylistStatusCommand(this.playListHandler),
        },
    ];
}
