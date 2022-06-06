import axios from 'axios';
import { YoutubeSearchRepository } from '../domain/interfaces/youtubeRepository'
import { SearchedSongRepository } from '../domain/interfaces/searchedSongRepository'

export class YoutubeAPIHandler implements YoutubeSearchRepository {
    public async searchSongByName(song: string, event: any): Promise<SearchedSongRepository[]> {
        const order = 'relevance';
        const part = 'snippet';
        const maxResults = '9';
        const type = 'video,playlist'

        const searched = await axios.get(`https://www.googleapis.com/youtube/v3/search?key=${process.env.API_KEY_YOUTUBE}&order=${order}&part=${part}&maxResults=${maxResults}&type=${type}&q=${song}`)
            .catch(err => {
                console.log('YoutubeAPI Search Error:', err);
                throw new Error(`YoutubeAPI Search Error: ${err.code}, ${err}`);
            })

        const response: SearchedSongRepository[] = [];
        searched.data.items.forEach((songData: any) => {
            response.push({
                id: songData.id.videoId,
                title: songData.snippet.title,
            })
        })

        return response;
    }

    public async searchPlaylist(playListId: string): Promise<SearchedSongRepository[]> {
        const part = 'snippet';
        const playlistId = playListId
        const maxResults = '30'

        const searched: any = await axios.get(`https://youtube.googleapis.com/youtube/v3/playlistItems?part=${part}&playlistId=${playlistId}&key=${process.env.API_KEY_YOUTUBE}&maxResults=${maxResults}`)
            .catch((err) => {
                console.log('YoutubeAPI PlayList Error:', err)
                throw new Error(`YoutubeAPI PlayList Error:, ${err.code}, ${err}`)
            })

        const response: SearchedSongRepository[] = [];
        searched.data.items.forEach((songData: any) => {
            response.push({
                id: songData.snippet.resourceId.videoId,
                title: songData.snippet.title,
            })
        })

        return response
    }

    public async searchSongById(songId: string): Promise<SearchedSongRepository> {
        const part = 'snippet,contentDetails';
        const maxResults = '1';
        const id = songId;
        const searched = await axios.get(`https://www.googleapis.com/youtube/v3/videos?key=${process.env.API_KEY_YOUTUBE}&part=${part}&maxResults=${maxResults}&id=${id}`)
            .catch(err => {
                console.log(`YoutubeAPI Data Error: ${err}`);
                throw new Error(`YoutubeAPI Data Error:, ${err.code}, ${err}`)
            })

        const response: SearchedSongRepository = {
            title: searched.data.items[0].snippet.title,
            durationString: searched.data.items[0].contentDetails.duration,
        };

        return response;
    }
}
