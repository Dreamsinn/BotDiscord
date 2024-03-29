import axios from 'axios';
import * as qs from 'qs';
import { APIResponse } from '../domain/interfaces/APIResponse';
import { SpotifyRawSong } from '../domain/interfaces/song';
import { SpotifyAPI } from '../domain/interfaces/SpotifyAPI';

export class SpotifyAPIService extends SpotifyAPI {
    protected token: string | undefined;

    protected async getToken(): Promise<void> {
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

    public async getSongsDataFromSpotifyPlaylistId(
        playListId: string,
    ): Promise<APIResponse<SpotifyRawSong[]>> {
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

            const songsId: string[] = [];
            // eslint-disable-next-line no-undef
            response.data.items.forEach((song: SpotifyApi.PlaylistTrackObject) => {
                if (song.track) {
                    // example of href: https://api.spotify.com/v1/tracks/15JINEqzVMv3SvJTAXAKED
                    songsId.push(song.track.href.substring(34));
                }
            });

            return this.getSongDataFromSpotifyId(String(songsId));
        } catch (err) {
            if (err.response?.data.error?.message === 'The access token expired') {
                console.log('Spotify token refresh');
                this.token = undefined;
                return this.getSongsDataFromSpotifyPlaylistId(playListId);
            }

            return {
                isError: true,
                data: null,
                errorData: err.response?.data ?? err,
            };
        }
    }

    public async getSongDataFromSpotifyId(songId: string): Promise<APIResponse<SpotifyRawSong[]>> {
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

            const songsData: SpotifyRawSong[] = response.data.tracks.map(
                // eslint-disable-next-line no-undef
                (song: SpotifyApi.TrackObjectFull) => {
                    const durationInSeconds = (song.duration_ms / 1000).toFixed(0);
                    const newSong: SpotifyRawSong = {
                        songName: song.name,
                        spotifySongId: song.id,
                        songAuthor: song.artists[0].name,
                        duration: String(durationInSeconds),
                        thumbnails: song.album.images[0].url,
                    };

                    return newSong;
                },
            );

            return {
                isError: false,
                data: songsData,
            };
        } catch (err) {
            if (err.response?.data.error?.message === 'The access token expired') {
                console.log('Spotify token refresh');
                this.token = undefined;
                return this.getSongDataFromSpotifyId(songId);
            }

            return {
                isError: true,
                data: null,
                errorData: err.response?.data ?? err,
            };
        }
    }
}
