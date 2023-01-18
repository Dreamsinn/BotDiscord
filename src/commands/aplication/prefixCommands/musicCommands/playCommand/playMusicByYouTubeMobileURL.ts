import { Message } from 'discord.js';
import { PlayCommand } from '../../../../domain/interfaces/playCommand';
import { RawSongData } from '../../../../domain/interfaces/songData';

export class PlayMusicByYouTubeMobileURL extends PlayCommand {
    async call(event: Message, url: string): Promise<RawSongData | undefined> {
        const songId = url.replace('https://youtu.be/', '').replace(/^./, '');

        const song: RawSongData = { id: songId };

        return this.mapSongData(event, song);
    }
}
