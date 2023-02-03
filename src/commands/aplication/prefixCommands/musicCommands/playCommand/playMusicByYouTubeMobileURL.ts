import { Message } from 'discord.js';
import { PlayCommand } from '../../../../domain/interfaces/playCommand';
import { Song } from '../../../../domain/interfaces/song';

export class PlayMusicByYouTubeMobileURL extends PlayCommand {
    async call(event: Message, url: string): Promise<Song | void> {
        const songId = url.replace('https://youtu.be/', '').replace(/^./, '');

        const songData = await this.mapSongData(event, songId);
        if (!songData) {
            return;
        }
        return songData;
    }
}
