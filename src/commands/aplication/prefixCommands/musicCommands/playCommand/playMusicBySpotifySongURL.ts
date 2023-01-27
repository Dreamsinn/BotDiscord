import { Message } from 'discord.js';
import { APIResponse } from '../../../../domain/interfaces/APIResponse';
import { PlayCommand } from '../../../../domain/interfaces/playCommand';
import { RawSong, Song } from '../../../../domain/interfaces/song';

export class PlayMusicBySpotifySongURL extends PlayCommand {
    public async call(event: Message, url: string) {
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

    private async mapSongDataFromSpotify(event: Message, songsId: string): Promise<Song | void> {
        const spotifyResponse: APIResponse<RawSong[]> =
            await this.spotifyService.getSongDataFromSpotifyId(songsId);
        console.log(spotifyResponse);
        if (!spotifyResponse.isError) {
            const song: Song = {
                songId: songsId,
                songName: spotifyResponse.data[0].songName,
                duration: this.parseSongDuration(String(spotifyResponse.data[0].duration), true),
                thumbnails: spotifyResponse.data[0].thumbnails,
                origin: 'Spotify',
            };
            return song;
        }

        event.channel.send(`It has not been possible to get song's information`);
        console.log(`Spotify getSongInfo Error: ${spotifyResponse.errorData}`);
        return;
    }
}
