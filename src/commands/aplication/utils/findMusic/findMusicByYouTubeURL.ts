import { Message } from 'discord.js';
import { SearchSong } from '../../../domain/interfaces/searchSong';
import { SongData } from '../../../domain/interfaces/song';

export class FindMusicByYouTubeURL extends SearchSong {
    async call(event: Message, argument: string): Promise<SongData | void> {
        return this.findSongIdFromYoutubeURL(event, argument);
    }
}
