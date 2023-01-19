import { Message } from 'discord.js';
import { PlayCommand } from '../../../../domain/interfaces/playCommand';
import { Song } from '../../../../domain/interfaces/song';

export class PlayMusicByYouTubeURL extends PlayCommand {
    async call(event: Message, url: string): Promise<Song | void> {
        return this.findSongIdFromYoutubeURL(event, url);
    }
}
