import { Message } from 'discord.js';
import { PlayCommand } from '../../../../domain/interfaces/playCommand';
import { SongData } from '../../../../domain/interfaces/songData';

export class PlayMusicByYouTubeMobileURL extends PlayCommand {
    async call(event: Message, url: string): Promise<SongData | void> {
        const songId = url.replace('https://youtu.be/', '').replace(/^./, '');

        return this.mapSongData(event, songId);
    }
}
