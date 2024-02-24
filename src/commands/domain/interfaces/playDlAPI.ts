import { SoundCloudStream, YouTubeStream } from 'play-dl';
import { APIResponse } from './APIResponse';
import { RawSong } from './song';

export abstract class PlayDlAPI {
  abstract searchSongByName(
    argument: string,
    maxResults: number,
  ): Promise<APIResponse<RawSong[]>>;
  abstract getSongInfo(songId: string): Promise<APIResponse<RawSong>>;
  abstract getSognsInfoFromPlayList(url: string): Promise<APIResponse<RawSong[]>>;
  abstract getSongStream(songId: string): Promise<YouTubeStream | SoundCloudStream>;
}
