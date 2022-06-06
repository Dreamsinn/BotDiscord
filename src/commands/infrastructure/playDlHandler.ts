import { YouTubeVideo, InfoData, YouTubeStream, SoundCloudStream, YouTubePlayList, } from 'play-dl';
import { PlayDlRepository } from '../domain/interfaces/playDlRepository'
import { SearchedSongRepository } from '../domain/interfaces/searchedSongRepository'
import play from 'play-dl';



export class PlayDlHandler implements PlayDlRepository {
    public async searchSongByName(songString: string): Promise<SearchedSongRepository[]> {
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

    public async getSongInfo(songId: string): Promise<YouTubeVideo> {
        const song: InfoData = await play.video_basic_info(`https://www.youtube.com/watch?v=${songId}`)

        const songData: YouTubeVideo = song.video_details

        return songData
    }

    public async getSognsInfoFromPlayList(url: string): Promise<SearchedSongRepository[]> {
        const rawPlayList: YouTubePlayList = await play.playlist_info(url, { incomplete: true })

        const platlistData = await rawPlayList.all_videos()

        const playList: SearchedSongRepository[] = []
        platlistData.forEach((songData: YouTubeVideo) => {
            const newSong: SearchedSongRepository = {
                title: songData.title,
                id: songData.id,
                duration: songData.durationInSec,
            }
            playList.push(newSong)
        })

        return playList
    }

    public async getSongStream(songId: string): Promise<YouTubeStream | SoundCloudStream> {
        const song: YouTubeStream | SoundCloudStream = await play.stream(`https://www.youtube.com/watch?v=${songId}`)
        return song
    }
}
