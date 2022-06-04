import axios from 'axios';
import { YoutubeSearchRepository } from '../domain/interfaces/youtubeRepository'
import { SearchedSongRepository } from '../domain/interfaces/searchedSongRepository'
import { CommandOutput } from '../domain/interfaces/commandOutput';

export class YoutubeAPIHandler implements YoutubeSearchRepository {
    public async searchSongByName(song: string, event: any) {
        const order = 'relevance';
        const part = 'snippet';
        // se le tendria que anyadir id a PART
        const maxResults = '9';
        // se pone con coma
        const type = 'video,playlist'

        const searched = await axios.get(`https://www.googleapis.com/youtube/v3/search?key=${process.env.API_KEY_YOUTUBE}&order=${order}&part=${part}&maxResults=${maxResults}&type=${type}&q=${song}`)

            .catch(err => {
                console.log('ERROR', err);
                return event.channel.send(`Error: ${err.code}, ${err}`);
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

    public async searchSongById(songId: string) {
        const part = 'contentDetails';
        // se le tendria que anyadir id a PART
        const maxResults = '1';
        const id = songId;
        const response = await axios.get(`https://www.googleapis.com/youtube/v3/videos?key=${process.env.API_KEY_YOUTUBE}&part=${part}&maxResults=${maxResults}&id=${id}`)
            .catch(error => {
                console.log('EROOR', error);
                return error.response.data.error;
            })
        return response;
    }
}
