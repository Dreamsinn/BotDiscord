import { ConnectionHandler } from '../database/connectionHandler';
import { PlayListHandler } from './aplication/playListHandler';
import { DisplayEmbedBuilder } from './aplication/utils/displayEmbedBuilder';
import { FindMusicByName } from './aplication/utils/findMusic/findMusicByName';
import { FindMusicBySpotifySongURL } from './aplication/utils/findMusic/findMusicBySpotifySongURL';
import { FindMusicByYouTubeMobileURL } from './aplication/utils/findMusic/findMusicByYouTubeMobileURL';
import { FindMusicByYouTubeURL } from './aplication/utils/findMusic/findMusicByYouTubeURL';
import { FindPlaylistBySpotifyURL } from './aplication/utils/findMusic/findPlaylistBySpotifyURL';
import { FindPlayListByYoutubeURL } from './aplication/utils/findMusic/findPlayListByYoutubeURL';
import { CommandsDependencies } from './commandsDependencies';
import { MusicAPIs } from './domain/interfaces/musicAPIs';
import { SchemaDictionary } from './domain/interfaces/schemaDictionary';

export abstract class CommandsServerDependencies {
    // dependencies instancied once
    protected databaseConnection: ConnectionHandler;
    protected musicAPIs: MusicAPIs;
    protected findMusicByName: FindMusicByName;
    protected findMusicByYouTubeMobileURL: FindMusicByYouTubeMobileURL;
    protected findPlayListByYoutubeURL: FindPlayListByYoutubeURL;
    protected findMusicByYouTubeURL: FindMusicByYouTubeURL;
    protected findMusicBySpotifySongURL: FindMusicBySpotifySongURL;
    protected findMusicBySpotifyPlaylistURL: FindPlaylistBySpotifyURL;

    // dependencies instancied by server
    protected displayEmbedBuilder = new DisplayEmbedBuilder();
    protected schemaDictionary: SchemaDictionary;
    protected playListHandler: PlayListHandler;

    constructor(schemaDictionary: SchemaDictionary, commandsDependencies: CommandsDependencies) {
        // dependencies instancied once
        this.musicAPIs = commandsDependencies.musicAPIs;
        this.databaseConnection = commandsDependencies.databaseConnection;
        this.findMusicByName = commandsDependencies.findMusicByName;
        this.findMusicByYouTubeMobileURL = commandsDependencies.findMusicByYouTubeMobileURL;
        this.findPlayListByYoutubeURL = commandsDependencies.findPlayListByYoutubeURL;
        this.findMusicByYouTubeURL = commandsDependencies.findMusicByYouTubeURL;
        this.findMusicBySpotifySongURL = commandsDependencies.findMusicBySpotifySongURL;
        this.findMusicBySpotifyPlaylistURL = commandsDependencies.findMusicBySpotifyPlaylistURL;

        // dependencies instancied by server
        this.schemaDictionary = schemaDictionary;
        this.playListHandler = new PlayListHandler(this.musicAPIs.playDlAPI, this.displayEmbedBuilder);
    }
}
