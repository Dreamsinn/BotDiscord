import { PlayDlService } from '../../infrastructure/playDlService';
import { SpotifyAPIService } from '../../infrastructure/spotifyAPIService';
import { YouTubeAPIService } from '../../infrastructure/youTubeAPIService';

export interface MusicAPIs {
    youtubeAPI: YouTubeAPIService;
    playDlAPI: PlayDlService;
    spotifyAPI: SpotifyAPIService;
}
