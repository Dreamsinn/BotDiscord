import { Message } from 'discord.js';
import { APIResponse } from './APIResponse';
import { RawSongData } from './songData';

export abstract class YoutubeAPI {
    abstract searchSongByName(song: string, event: Message): Promise<APIResponse<RawSongData[]>>;
    abstract searchPlaylist(playListId: string): Promise<APIResponse<RawSongData[]>>;
    abstract searchSongById(songId: string): Promise<APIResponse<RawSongData>>;
}
