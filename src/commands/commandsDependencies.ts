import { ConnectionHandler } from '../database/connectionHandler';
import { FindMusicByName } from './aplication/utils/findMusic/findMusicByName';
import { FindMusicBySpotifySongURL } from './aplication/utils/findMusic/findMusicBySpotifySongURL';
import { FindMusicByYouTubeMobileURL } from './aplication/utils/findMusic/findMusicByYouTubeMobileURL';
import { FindMusicByYouTubeURL } from './aplication/utils/findMusic/findMusicByYouTubeURL';
import { FindPlaylistBySpotifyURL } from './aplication/utils/findMusic/findPlaylistBySpotifyURL';
import { FindPlayListByYoutubeURL } from './aplication/utils/findMusic/findPlayListByYoutubeURL';
import { MusicAPIs } from './domain/interfaces/musicAPIs';
import { PlayDlService } from './infrastructure/playDlService';
import { SpotifyAPIService } from './infrastructure/spotifyAPIService';
import { YouTubeAPIService } from './infrastructure/youTubeAPIService';

// command dependencies that don't need to be instanced by every server
export class CommandsDependencies {
    public musicAPIs: MusicAPIs = {
        youtubeAPI: new YouTubeAPIService(),
        playDlAPI: new PlayDlService(),
        spotifyAPI: new SpotifyAPIService(),
    };

    public findMusicByName = new FindMusicByName(this.musicAPIs);
    public findMusicByYouTubeMobileURL = new FindMusicByYouTubeMobileURL(this.musicAPIs);
    public findPlayListByYoutubeURL = new FindPlayListByYoutubeURL(this.musicAPIs);

    public findMusicByYouTubeURL = new FindMusicByYouTubeURL(this.musicAPIs);
    public findMusicBySpotifySongURL = new FindMusicBySpotifySongURL(this.musicAPIs);
    public findMusicBySpotifyPlaylistURL = new FindPlaylistBySpotifyURL(this.musicAPIs);

    constructor(public databaseConnection: ConnectionHandler) {}
}
