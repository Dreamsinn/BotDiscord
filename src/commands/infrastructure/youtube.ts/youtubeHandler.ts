import axios from 'axios';
import { YoutubeSearchRepository } from './youtubeRepository'

export class YoutubeSearch implements YoutubeSearchRepository {
    public async searchSongByName(song: string) {
        const order = 'relevance';
        const part = 'snippet';
        // se le tendria que anyadir id a PART
        const maxResults = '9';
        // se pone con coma
        const type = 'video,playlist'

        const response = await axios.get(`https://www.googleapis.com/youtube/v3/search?key=${process.env.API_KEY_YOUTUBE}&order=${order}&part=${part}&maxResults=${maxResults}&type=${type}&q=${song}`)
            .catch(error => {
                console.log('EROOR', error);
                return error.response.data.error;
            })
        // const response = {
        //     status: 101,
        //     data: {
        //         items: []
        //     }
        // }

        return response;
    }

    public async searchSongByURL(songId: string) {
        const part = 'id';
        // se le tendria que anyadir id a PART
        const maxResults = '1';
        const id = songId;
        const response = await axios.get(`https://www.googleapis.com/youtube/v3/search?key=${process.env.API_KEY_YOUTUBE}&part=${part}&maxResults=${maxResults}&id=${id}`)
            .catch(error => {
                console.log('EROOR', error);
                return error.response.data.error;
            })
        return response;
    }
}
