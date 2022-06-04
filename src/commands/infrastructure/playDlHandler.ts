import { YouTubeVideo, InfoData, } from 'play-dl';
import { PlayDlRepository } from '../domain/interfaces/playDlRepository'
import { SearchedSongRepository } from '../domain/interfaces/searchedSongRepository'
import play from 'play-dl';



export class PlayDlHandler implements PlayDlRepository {
    public async searchSongByName(songString: string) {
        const searched = await play.search(songString, { source: { youtube: "video" }, limit: 9 })

        const response: SearchedSongRepository[] = [];
        searched.forEach((songData) => {
            response.push({
                id: songData.id,
                title: songData.title,
                duration: songData.durationInSec
            })
        })

        return response;
    }

    public async getSongInfo(songId: string) {
        const song: InfoData = await play.video_basic_info(`https://www.youtube.com/watch?v=${songId}`)

        const songData: YouTubeVideo = song.video_details

        return songData
    }

    public async getSongStream(songId: string) {
        let song = await play.stream(`https://www.youtube.com/watch?v=${songId}`)
        return song
    }
}
