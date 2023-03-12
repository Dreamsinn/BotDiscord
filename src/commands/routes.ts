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
import { PlayCommand } from './aplication/prefixCommands/musicCommands/playCommand';
import { CreatePlaylistCommand } from './aplication/prefixCommands/musicCommands/playlist/createPlaylistCommand';
import { PlayListCommand } from './aplication/prefixCommands/musicCommands/playListCommand';
import { PlayNowCommand } from './aplication/prefixCommands/musicCommands/playNowCommand';
import { RemoveSongsFromPlayListCommand } from './aplication/prefixCommands/musicCommands/removeSongsFromPlayListCommand';
import { ShufflePlayListCommand } from './aplication/prefixCommands/musicCommands/shufflePlayListCommand';
import { SkipMusicCommand } from './aplication/prefixCommands/musicCommands/skipMusicCommand';
import { ReplyCommandToggler } from './aplication/prefixCommands/replyCommandToggler';
import { DisplayEmbedBuilder } from './aplication/utils/displayEmbedBuilder';
import { FindMusicByName } from './aplication/utils/findMusic/findMusicByName';
import { FindMusicBySpotifySongURL } from './aplication/utils/findMusic/findMusicBySpotifySongURL';
import { FindMusicByYouTubeMobileURL } from './aplication/utils/findMusic/findMusicByYouTubeMobileURL';
import { FindMusicByYouTubeURL } from './aplication/utils/findMusic/findMusicByYouTubeURL';
import { FindPlaylistBySpotifyURL } from './aplication/utils/findMusic/findPlaylistBySpotifyURL';
import { FindPlayListByYoutubeURL } from './aplication/utils/findMusic/findPlayListByYoutubeURL';
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
    private findMusicByName = new FindMusicByName(this.musicAPIs, this.usersUsingACommand);
    private findMusicByYouTubeMobileURL = new FindMusicByYouTubeMobileURL(this.musicAPIs);
    private findPlayListByYoutubeURL = new FindPlayListByYoutubeURL(
        this.musicAPIs,
        this.usersUsingACommand,
    );
    private findMusicByYouTubeURL = new FindMusicByYouTubeURL(this.musicAPIs);
    private findMusicBySpotifySongURL = new FindMusicBySpotifySongURL(this.musicAPIs);
    private findMusicBySpotifyPlaylistURL = new FindPlaylistBySpotifyURL(this.musicAPIs);

    constructor(
        private usersUsingACommand: UsersUsingACommand,
        private schemaDictionary: SchemaDictionary,
        private databaseConnection: ConnectionHandler,
    ) {}

    public routeList: Route[] = [
        {
            schema: this.schemaDictionary['Play Command'],
            command: new PlayCommand(
                this.playListHandler,
                this.findMusicByName,
                this.findMusicByYouTubeMobileURL,
                this.findPlayListByYoutubeURL,
                this.findMusicByYouTubeURL,
                this.findMusicBySpotifySongURL,
                this.findMusicBySpotifyPlaylistURL,
            ),
        },
        {
            schema: this.schemaDictionary['Playlist Command'],
            command: new PlayListCommand(this.playListHandler),
        },
        {
            schema: this.schemaDictionary['Help Command'],
            command: new HelpCommand(this.usersUsingACommand),
        },
        {
            schema: this.schemaDictionary['Pause Command'],
            command: new PauseCommand(this.playListHandler),
        },
        {
            schema: this.schemaDictionary['Skip Music Command'],
            command: new SkipMusicCommand(this.playListHandler),
        },
        {
            schema: this.schemaDictionary['Disconnect Command'],
            command: new DisconnectCommand(this.playListHandler),
        },
        {
            schema: this.schemaDictionary['Join Channel Command'],
            command: new JoinChannelCommand(this.playListHandler),
        },
        {
            schema: this.schemaDictionary['Clear Playlist Command'],
            command: new ClearPlayListCommand(this.playListHandler),
        },
        {
            schema: this.schemaDictionary['Remove Songs From Playlist Command'],
            command: new RemoveSongsFromPlayListCommand(this.playListHandler, this.usersUsingACommand),
        },
        {
            schema: this.schemaDictionary['Shuffle Playlist Command'],
            command: new ShufflePlayListCommand(this.playListHandler),
        },
        {
            schema: this.schemaDictionary['Loop Playlist Mode Command'],
            command: new LoopPlayListModeCommand(this.playListHandler),
        },
        {
            schema: this.schemaDictionary['Display Playlist Command'],
            command: new DisplayPlayListCommand(this.playListHandler),
        },
        {
            schema: this.schemaDictionary['Dice Command Toggler'],
            command: new DiceCommandToggler(),
        },
        {
            schema: this.schemaDictionary['Reply Command Toggler'],
            command: new ReplyCommandToggler(),
        },
        {
            schema: this.schemaDictionary['Log Playlist Status Command'],
            command: new LogPlaylistStatusCommand(this.playListHandler),
        },
        {
            schema: this.schemaDictionary['Play Now Command'],
            command: new PlayNowCommand(this.playListHandler, this.usersUsingACommand),
        },
        {
            schema: this.schemaDictionary['Config Server Command'],
            command: new ConfigServerCommand(this.databaseConnection, this.usersUsingACommand),
        },
        {
            schema: this.schemaDictionary['Config Schema Command'],
            command: new ConfigSchemaCommand(this.databaseConnection, this.usersUsingACommand),
        },
        {
            schema: this.schemaDictionary['Create Playlist Command'],
            command: new CreatePlaylistCommand(
                this.playListHandler,
                this.databaseConnection,
                this.usersUsingACommand,
                this.findMusicByName,
                this.findMusicByYouTubeMobileURL,
                this.findPlayListByYoutubeURL,
                this.findMusicByYouTubeURL,
                this.findMusicBySpotifySongURL,
                this.findMusicBySpotifyPlaylistURL,
            ),
        },
    ];
}
