import { Message } from 'discord.js';
import { APIResponse } from './APIResponse';
import { RawSong } from './song';

export abstract class YoutubeAPI {
    abstract searchSongByName(song: string, event: Message): Promise<APIResponse<RawSong[]>>;
    abstract searchPlaylist(playListId: string): Promise<APIResponse<RawSong[]>>;
    abstract searchSongById(songId: string): Promise<APIResponse<RawSong>>;
}
