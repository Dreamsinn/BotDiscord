import axios from 'axios';
import { APIResponse } from '../domain/interfaces/APIResponse';
import { RawSongData } from '../domain/interfaces/songData';
import { YoutubeAPI } from '../domain/interfaces/youtubeAPI';

export class YoutubeAPIHandler implements YoutubeAPI {
    public async searchSongByName(song: string): Promise<APIResponse<RawSongData[]>> {
        const order = 'relevance';
        const part = 'snippet';
        const maxResults = '9';
        const type = 'video,playlist';

        try {
            const searched = await axios.get(
                `https://www.googleapis.com/youtube/v3/search?key=${process.env.API_KEY_YOUTUBE}&order=${order}&part=${part}&maxResults=${maxResults}&type=${type}&q=${song}`,
            );

            const response: RawSongData[] = searched.data.items.map((songData: any) => {
                return {
                    id: songData.id.videoId,
                    title: songData.snippet.title,
                };
            });

            return {
                isError: false,
                data: response,
            };
        } catch (err) {
            return {
                isError: true,
                data: null,
                errorData: err,
            };
        }
    }

    public async searchPlaylist(playListId: string): Promise<APIResponse<RawSongData[]>> {
        const part = 'snippet';
        const playlistId = playListId;
        const maxResults = '30';

        try {
            const searched: any = await axios.get(
                `https://youtube.googleapis.com/youtube/v3/playlistItems?part=${part}&playlistId=${playlistId}&key=${process.env.API_KEY_YOUTUBE}&maxResults=${maxResults}`,
            );

            const response: RawSongData[] = searched.data.items.map((songData: any) => {
                return {
                    id: songData.snippet.resourceId.videoId,
                    title: songData.snippet.title,
                };
            });

            return {
                isError: false,
                data: response,
            };
        } catch (err) {
            return {
                isError: true,
                data: null,
                errorData: err,
            };
        }
    }

    public async searchSongById(songId: string): Promise<APIResponse<RawSongData>> {
        const part = 'snippet,contentDetails';
        const maxResults = '1';
        const id = songId;

        try {
            const searched = await axios.get(
                `https://www.googleapis.com/youtube/v3/videos?key=${process.env.API_KEY_YOUTUBE}&part=${part}&maxResults=${maxResults}&id=${id}`,
            );

            const response: RawSongData = {
                title: searched.data.items[0].snippet.title,
                durationString: searched.data.items[0].contentDetails.duration,
                thumbnails: searched.data.items[0].snippet.thumbnails.medium.url,
            };

            return {
                isError: false,
                data: response,
            };
        } catch (err) {
            return {
                isError: true,
                data: null,
                errorData: err,
            };
        }
    }
}
