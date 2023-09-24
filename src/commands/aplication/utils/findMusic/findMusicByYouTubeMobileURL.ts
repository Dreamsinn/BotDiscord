import { Message } from 'discord.js';
import { SearchSong } from '../../../domain/interfaces/searchSong';
import { SongData } from '../../../domain/interfaces/song';

export class FindMusicByYouTubeMobileURL extends SearchSong {
    async call(event: Message, argument: string): Promise<SongData | void> {
        const url = argument;

        const songId = url.replace('https://youtu.be/', '').replace(/^./, '');

        const songData = await this.mapSongData(event, songId);
        if (!songData) {
            return;
        }
        return songData;
    }
}
