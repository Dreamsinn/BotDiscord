import { Message } from 'discord.js';
import { APIResponse } from '../../../../domain/interfaces/APIResponse';
import { PlayCommand } from '../../../../domain/interfaces/playCommand';
import { RawSong, Song } from '../../../../domain/interfaces/song';

export class PlayMusicBySpotifyPlaylistURL extends PlayCommand {
    public async call(event: Message, url: string) {
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
        const spotifyResponse: APIResponse<RawSong[]> =
            await this.spotifyService.getSongsDataFromSpotifyPlaylistId(playListId);

        if (!spotifyResponse.isError) {
            const playlist: Song[] = spotifyResponse.data.map((rawSong: RawSong) => {
                const song: Song = {
                    songId: rawSong.songId,
                    songName: rawSong.songName,
                    duration: this.parseSongDuration(String(rawSong.duration), true),
                    thumbnails: rawSong.thumbnails,
                    origin: 'Spotify',
                };
                return song;
            });
            return playlist;
        }

        event.channel.send(`It has not been possible to get playlisy information`);
        console.log(`Spotify get playlisy info Error: ${spotifyResponse.errorData}`);
        return;
    }
}
