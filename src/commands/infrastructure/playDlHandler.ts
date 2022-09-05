import play, { InfoData, SoundCloudStream, YouTubePlayList, YouTubeStream, YouTubeVideo } from 'play-dl';
import { PlayDlAPI } from '../domain/interfaces/playDlAPI';
import { RawSongData } from '../domain/interfaces/songData';
import { APIResponse } from '../domain/interfaces/APIResponse';

export class PlayDlHandler implements PlayDlAPI {
    public async searchSongByName(songString: string): Promise<APIResponse<RawSongData[]>> {
        try{
            const searched = await play.search(undefined, { source: { youtube: 'video' }, limit: 9 });

            const response: RawSongData[] = [];
            searched.forEach((songData) => {
                response.push({
                    id: songData.id,
                    title: songData.title,
                    duration: songData.durationInSec,
                });
            });

            return {
                isError: false,
                data: response
            };
        } catch (err){
            return {
                isError: true,
                data: null,
                errorData: err
            };
        }
    }

    public async getSongInfo(songId: string): Promise<APIResponse<YouTubeVideo>> {
        try{
            const song: InfoData = await play.video_basic_info(`https://www.youtube.com/watch?v=${songId}`);

            const songData: YouTubeVideo = song.video_details;

            return {
                isError: false,
                data: songData
            };
        } catch (err){
            return {
                isError: true,
                data: null,
                errorData: err
            };
        }
    }

    public async getSognsInfoFromPlayList(url: string): Promise<APIResponse<RawSongData[]>> {
        try{
            const rawPlayList: YouTubePlayList = await play.playlist_info(url, { incomplete: true });

            const platlistData = await rawPlayList.all_videos();

            const playList: RawSongData[] = [];
            platlistData.forEach((songData: YouTubeVideo) => {
                const newSong: RawSongData = {
                    title: songData.title,
                    id: songData.id,
                    duration: songData.durationInSec,
                    thumbnails: songData.thumbnails[3] ? songData.thumbnails[3].url :
                        songData.thumbnails[2] ? songData.thumbnails[2].url :
                            songData.thumbnails[1] ? songData.thumbnails[1].url :
                                songData.thumbnails[0] ? songData.thumbnails[0].url :
                                    null,
                };
                playList.push(newSong);
            });

            return {
                isError: false,
                data: playList
            };
        } catch (err){
            return {
                isError: true,
                data: null,
                errorData: err
            };
        }
    }

    public async getSongStream(songId: string): Promise<YouTubeStream | SoundCloudStream> {
        const song: YouTubeStream | SoundCloudStream = await play.stream(
            `https://www.youtube.com/watch?v=${songId}`,
        );

        return song;
    }
}
