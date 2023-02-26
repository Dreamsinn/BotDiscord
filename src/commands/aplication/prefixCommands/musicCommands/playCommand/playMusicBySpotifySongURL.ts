import { Message } from 'discord.js';
import { APIResponse } from '../../../../domain/interfaces/APIResponse';
import { PlayCommand } from '../../../../domain/interfaces/playCommand';
import { SongData, SpotifyRawSong } from '../../../../domain/interfaces/song';

export class PlayMusicBySpotifySongURL extends PlayCommand {
    public async call(event: Message, url: string): Promise<SongData | void> {
        const songIdPosition = url.indexOf('track/');
        const pathParameterPosition = url.indexOf('?si');

        const songId =
            pathParameterPosition !== -1
                ? url.substring(songIdPosition + 6, pathParameterPosition)
                : url.substring(songIdPosition + 6);

        const songData = await this.mapSongDataFromSpotify(event, songId);
        if (this.isSongData(songData)) {
            return songData;
        }

        return;
    }

    private async mapSongDataFromSpotify(event: Message, songId: string): Promise<SongData | void> {
        const spotifyResponse: APIResponse<SpotifyRawSong[]> =
            await this.spotifyService.getSongDataFromSpotifyId(songId);

        if (!spotifyResponse.isError) {
            if (spotifyResponse.data[0]) {
                return await this.mapSpotifySongData(spotifyResponse.data[0]);
            }
        } else {
            event.channel.send(`It has not been possible to get song's information`);
            console.log(`Spotify get song info Error: ${spotifyResponse.errorData}`);
            return;
        }
    }
}
