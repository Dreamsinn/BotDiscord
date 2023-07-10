import { APIResponse } from './APIResponse';
import { RawSong } from './song';

export abstract class YoutubeAPI {
    abstract searchSongByName(song: string, maxResults: number): Promise<APIResponse<RawSong[]>>;
    abstract searchPlaylist(playListId: string): Promise<APIResponse<string>>;
    abstract searchSongById(songId: string): Promise<APIResponse<RawSong[]>>;
}
