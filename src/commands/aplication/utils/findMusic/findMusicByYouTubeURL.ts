import { Message } from 'discord.js';
import { PlayCommand } from '../../../domain/interfaces/playCommand';
import { SongData } from '../../../domain/interfaces/song';

export class FindMusicByYouTubeURL extends PlayCommand {
    async call(event: Message, argument: string): Promise<SongData | void> {
        return this.findSongIdFromYoutubeURL(event, argument);
    }
}
