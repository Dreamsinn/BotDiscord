import axios from 'axios';
import * as qs from 'qs';
import { APIResponse } from '../domain/interfaces/APIResponse';
import { RawSong } from '../domain/interfaces/song';

export class SpotifyAPIService {
    private token: string | undefined;

    private async getToken(): Promise<void> {
        const headers = {
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            auth: {
                username: String(process.env.SPOTY_CLIENT_ID),
                password: String(process.env.SPOTY_CLIENT_SECRET),
            },
        };

        try {
            const response = await axios.post(
                'https://accounts.spotify.com/api/token',
                qs.stringify({ grant_type: 'client_credentials' }),
                headers,
            );
            this.token = response.data.access_token;
        } catch (err) {
            throw new Error(`Error creating Spotyfy API token: ${err.message}`);
        }
    }

    public async getSongsDataFromSpotifyPlaylistId(playListId: string): Promise<APIResponse<RawSong[]>> {
        try {
            if (!this.token) {
                await this.getToken();
            }

            const limit = 50;
            const response = await axios.get(
                `https://api.spotify.com/v1/playlists/${playListId}/tracks?market=ES&fields=items(added_by.id%2Ctrack(name%2Chref%2Calbum(name%2Chref)))&limit=${limit}&offset=0`,
                {
                    headers: {
                        Authorization: `Bearer ${this.token}`,
                    },
                },
            );

            const songsId: string[] = response.data.items.map((song: SpotifyApi.PlaylistTrackObject) =>
                // example of href: https://api.spotify.com/v1/tracks/15JINEqzVMv3SvJTAXAKED
                song.track.href.substring(34),
            );

            return this.getSongDataFromSpotifyId(String(songsId));
        } catch (err) {
            return {
                isError: true,
                data: null,
                errorData: err.response?.data ?? err,
            };
        }
    }

    public async getSongDataFromSpotifyId(songId: string): Promise<APIResponse<RawSong[]>> {
        try {
            if (!this.token) {
                await this.getToken();
            }

            // songId can be an id or ids splits with ' , '
            const response = await axios.get(
                `https://api.spotify.com/v1/tracks?market=ES&ids=${songId}`,
                {
                    headers: {
                        Authorization: `Bearer ${this.token}`,
                    },
                },
            );

            if (!response.data.tracks[0]) {
                throw new Error('Not found');
            }

            const songsData: RawSong[] = response.data.tracks.map((song: SpotifyApi.TrackObjectFull) => {
                const durationInSeconds = (song.duration_ms/1000).toFixed(0)
                const newSong: RawSong = {
                    songName: song.name,
                    songId: song.id,
                    duration: String(durationInSeconds),
                    thumbnails: song.album.images[0].url,
                };

                return newSong;
            });

            return {
                isError: false,
                data: songsData,
            };
        } catch (err) {
            return {
                isError: true,
                data: null,
                errorData: err.response?.data ?? err,
            };
        }
    }
}
