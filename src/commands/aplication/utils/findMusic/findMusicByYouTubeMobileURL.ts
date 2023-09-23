import { Message } from 'discord.js';
import { PlayCommand } from '../../../domain/interfaces/playCommand';
import { SongData } from '../../../domain/interfaces/song';

export class FindMusicByYouTubeMobileURL extends PlayCommand {
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
