import { Message } from 'discord.js';
import { APIResponse } from '../../../../domain/interfaces/APIResponse';
import { PlayCommand } from '../../../../domain/interfaces/playCommand';
import { Song, SpotifyRawSong } from '../../../../domain/interfaces/song';

export class PlayPlaylistBySpotifyURL extends PlayCommand {
    public async call(event: Message, url: string): Promise<Song[] | void> {
        const idPosition = url.indexOf('playlist/');
        const pathParameterPosition = url.indexOf('?si');

        const playListId =
            pathParameterPosition !== -1
                ? url.substring(idPosition + 9, pathParameterPosition)
                : url.substring(idPosition + 9);

        const playListData = await this.mapPlaylistDataFromSpotify(event, playListId);
        if (playListData) {
            return playListData;
        }

        return;
    }

    private async mapPlaylistDataFromSpotify(
        event: Message,
        playListId: string,
    ): Promise<Song[] | void> {
        const spotifyResponse: APIResponse<SpotifyRawSong[]> =
            await this.spotifyService.getSongsDataFromSpotifyPlaylistId(playListId);

        if (!spotifyResponse.isError) {
            const playlist: Song[] = [];

            for (const rawSong of spotifyResponse.data) {
                const song = await this.mapSpotifySongData(rawSong);
                if (song) {
                    playlist.push(song);
                }
            }

            return playlist;
        }

        event.channel.send(`It has not been possible to get playlisy information`);
        console.log(`Spotify get playlisy info Error: ${spotifyResponse.errorData}`);
        return;
    }
}
