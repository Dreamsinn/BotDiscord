import { Message } from 'discord.js';
import { rawSongData } from './songData';

export abstract class YoutubeAPI {
    abstract searchSongByName(song: string, event: Message): Promise<rawSongData[]>;
    abstract searchPlaylist(playListId: string): Promise<rawSongData[]>;
    abstract searchSongById(songId: string): Promise<rawSongData>;
}
