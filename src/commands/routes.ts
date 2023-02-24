import { ConnectionHandler } from '../database/connectionHandler';
import { PlayListHandler } from './aplication/playListHandler';
import { ConfigSchemaCommand } from './aplication/prefixCommands/configSchemaCommand/configSchemaCommand';
import { ConfigServerCommand } from './aplication/prefixCommands/configServerCommand/configServerCommand';
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
import { PlayMusicBySpotifySongURL } from './aplication/prefixCommands/musicCommands/playCommand/playMusicBySpotifySongURL';
import { PlayMusicByYouTubeMobileURL } from './aplication/prefixCommands/musicCommands/playCommand/playMusicByYouTubeMobileURL';
import { PlayMusicByYouTubeURL } from './aplication/prefixCommands/musicCommands/playCommand/playMusicByYouTubeURL';
import { PlayPlaylistBySpotifyURL } from './aplication/prefixCommands/musicCommands/playCommand/playPlaylistBySpotifyURL';
import { PlayPlayListByYoutubeURL } from './aplication/prefixCommands/musicCommands/playCommand/playPlayListByYoutubeURL';
import { PlayListCommand } from './aplication/prefixCommands/musicCommands/playListCommand';
import { PlayNowCommand } from './aplication/prefixCommands/musicCommands/playNowCommand';
import { RemoveSongsFromPlayListCommand } from './aplication/prefixCommands/musicCommands/removeSongsFromPlayListCommand';
import { ShufflePlayListCommand } from './aplication/prefixCommands/musicCommands/shufflePlayListCommand';
import { SkipMusicCommand } from './aplication/prefixCommands/musicCommands/skipMusicCommand';
import { ReplyCommandToggler } from './aplication/prefixCommands/replyCommandToggler';
import { DisplayEmbedBuilder } from './aplication/utils/displayEmbedBuilder';
import { UsersUsingACommand } from './aplication/utils/usersUsingACommand';
import { Command } from './domain/interfaces/Command';
import { CommandSchema } from './domain/interfaces/commandSchema';
import { MusicAPIs } from './domain/interfaces/musicAPIs';
import { SchemaDictionary } from './domain/interfaces/schemaDictionary';
import { PlayDlService } from './infrastructure/playDlService';
import { SpotifyAPIService } from './infrastructure/spotifyAPIService';
import { YouTubeAPIService } from './infrastructure/youTubeAPIService';

interface Route {
    schema: CommandSchema;
    command: Command;
}

export class Routes {
    private musicAPIs: MusicAPIs = {
        youtubeAPI: new YouTubeAPIService(),
        playDlAPI: new PlayDlService(),
        spotifyAPI: new SpotifyAPIService(),
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
    private playMusicBySpotifySongURL = new PlayMusicBySpotifySongURL(this.musicAPIs);
    private playMusicBySpotifyPlaylistURL = new PlayPlaylistBySpotifyURL(this.musicAPIs);

    constructor(
        private usersUsingACommand: UsersUsingACommand,
        private schemaDictionary: SchemaDictionary,
        private databaseConnection: ConnectionHandler,
    ) {}

    public routeList: Route[] = [
        {
            schema: this.schemaDictionary['Play Command'],
            command: new PlayCommandHandler(
                this.schemaDictionary['Play Command'],
                this.playListHandler,
                this.playMusicByName,
                this.playMusicByYouTubeMobileURL,
                this.playPlayListByYoutubeURL,
                this.playMusicByYouTubeURL,
                this.playMusicBySpotifySongURL,
                this.playMusicBySpotifyPlaylistURL,
            ),
        },
        {
            schema: this.schemaDictionary['Playlist Command'],
            command: new PlayListCommand(
                this.schemaDictionary['Playlist Command'],
                this.playListHandler,
            ),
        },
        {
            schema: this.schemaDictionary['Help Command'],
            command: new HelpCommand(this.schemaDictionary['Help Command'], this.usersUsingACommand),
        },
        {
            schema: this.schemaDictionary['Pause Command'],
            command: new PauseCommand(this.schemaDictionary['Pause Command'], this.playListHandler),
        },
        {
            schema: this.schemaDictionary['Skip Music Command'],
            command: new SkipMusicCommand(
                this.schemaDictionary['Skip Music Command'],
                this.playListHandler,
            ),
        },
        {
            schema: this.schemaDictionary['Disconnect Command'],
            command: new DisconnectCommand(
                this.schemaDictionary['Disconnect Command'],
                this.playListHandler,
            ),
        },
        {
            schema: this.schemaDictionary['Join Channel Command'],
            command: new JoinChannelCommand(
                this.schemaDictionary['Join Channel Command'],
                this.playListHandler,
            ),
        },
        {
            schema: this.schemaDictionary['Clear Playlist Command'],
            command: new ClearPlayListCommand(
                this.schemaDictionary['Clear Playlist Command'],
                this.playListHandler,
            ),
        },
        {
            schema: this.schemaDictionary['Remove Songs From Playlist Command'],
            command: new RemoveSongsFromPlayListCommand(
                this.schemaDictionary['Remove Songs From Playlist Command'],
                this.playListHandler,
                this.usersUsingACommand,
            ),
        },
        {
            schema: this.schemaDictionary['Shuffle Playlist Command'],
            command: new ShufflePlayListCommand(
                this.schemaDictionary['Shuffle Playlist Command'],
                this.playListHandler,
            ),
        },
        {
            schema: this.schemaDictionary['Loop Playlist Mode Command'],
            command: new LoopPlayListModeCommand(
                this.schemaDictionary['Loop Playlist Mode Command'],
                this.playListHandler,
            ),
        },
        {
            schema: this.schemaDictionary['Display Playlist Command'],
            command: new DisplayPlayListCommand(
                this.schemaDictionary['Display Playlist Command'],
                this.playListHandler,
            ),
        },
        {
            schema: this.schemaDictionary['Dice Command Toggler'],
            command: new DiceCommandToggler(this.schemaDictionary['Dice Command Toggler']),
        },
        {
            schema: this.schemaDictionary['Reply Command Toggler'],
            command: new ReplyCommandToggler(this.schemaDictionary['Reply Command Toggler']),
        },
        {
            schema: this.schemaDictionary['Log Playlist Status Command'],
            command: new LogPlaylistStatusCommand(
                this.schemaDictionary['Log Playlist Status Command'],
                this.playListHandler,
            ),
        },
        {
            schema: this.schemaDictionary['Play Now Command'],
            command: new PlayNowCommand(
                this.schemaDictionary['Play Now Command'],
                this.playListHandler,
                this.usersUsingACommand,
            ),
        },
        {
            schema: this.schemaDictionary['Config Server Command'],
            command: new ConfigServerCommand(
                this.schemaDictionary['Config Server Command'],
                this.databaseConnection,
                this.usersUsingACommand,
            ),
        },
        {
            schema: this.schemaDictionary['Config Schema Command'],
            command: new ConfigSchemaCommand(
                this.schemaDictionary['Config Schema Command'],
                this.databaseConnection,
                this.usersUsingACommand,
            ),
        },
    ];
}
