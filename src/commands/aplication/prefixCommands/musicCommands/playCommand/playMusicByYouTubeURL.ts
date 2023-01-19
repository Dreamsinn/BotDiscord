import { Message } from 'discord.js';
import { PlayCommand } from '../../../../domain/interfaces/playCommand';
import { SongData } from '../../../../domain/interfaces/songData';

export class PlayMusicByYouTubeURL extends PlayCommand {
    async call(event: Message, url: string): Promise<SongData | void> {
        return this.findSongIdFromYoutubeURL(event, url);
    }
}
