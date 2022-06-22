import { SoundCloudStream, YouTubeStream, YouTubeVideo } from 'play-dl';
import { RawSongData } from './songData';

export abstract class PlayDlAPI {
    abstract searchSongByName(argument: string): Promise<RawSongData[]>;
    abstract getSongInfo(songId: string): Promise<YouTubeVideo>;
    abstract getSognsInfoFromPlayList(url: string): Promise<RawSongData[]>;
    abstract getSongStream(songId: string): Promise<YouTubeStream | SoundCloudStream>;
}
