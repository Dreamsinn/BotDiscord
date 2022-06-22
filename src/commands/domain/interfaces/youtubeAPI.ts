import { Message } from 'discord.js';
import { RawSongData } from './songData';

export abstract class YoutubeAPI {
    abstract searchSongByName(song: string, event: Message): Promise<RawSongData[]>;
    abstract searchPlaylist(playListId: string): Promise<RawSongData[]>;
    abstract searchSongById(songId: string): Promise<RawSongData>;
}
