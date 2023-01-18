import { Message } from 'discord.js';
import { PlayCommand } from '../../../../domain/interfaces/playCommand';
import { RawSongData } from '../../../../domain/interfaces/songData';

export class PlayMusicByYouTubeURL extends PlayCommand {
    async call(event: Message, url: string): Promise<RawSongData> {
        return this.findSongIdFromYoutubeURL(event, url);
    }
}
