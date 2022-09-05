import { SoundCloudStream, YouTubeStream, YouTubeVideo } from 'play-dl';
import { APIResponse } from './APIResponse';
import { RawSongData } from './songData';

export abstract class PlayDlAPI {
    abstract searchSongByName(argument: string): Promise<APIResponse<RawSongData[]>>;
    abstract getSongInfo(songId: string): Promise<APIResponse<YouTubeVideo>>;
    abstract getSognsInfoFromPlayList(url: string): Promise<APIResponse<RawSongData[]>>;
    abstract getSongStream(songId: string): Promise<YouTubeStream | SoundCloudStream>;
}
