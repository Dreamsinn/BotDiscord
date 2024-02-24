import play, {
  InfoData,
  SoundCloudStream,
  YouTubePlayList,
  YouTubeStream,
  YouTubeVideo,
} from 'play-dl';
import { APIResponse } from '../domain/interfaces/APIResponse';
import { PlayDlAPI } from '../domain/interfaces/playDlAPI';
import { RawSong } from '../domain/interfaces/song';

export class PlayDlService implements PlayDlAPI {
  public async searchSongByName(
    songString: string,
    maxResults = 9,
  ): Promise<APIResponse<RawSong[]>> {
    try {
      const searched = await play.search(songString, {
        source: { youtube: 'video' },
        limit: maxResults,
      });

      const response: RawSong[] = [];
      searched.forEach(songData => {
        if (songData.id) {
          const newSong: RawSong = {
            songId: songData.id,
            songName: songData.title,
            duration: String(songData.durationInSec),
          };
          response.push(newSong);
        }
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

  public async getSongInfo(songId: string): Promise<APIResponse<RawSong>> {
    try {
      const response: InfoData = await play.video_basic_info(
        `https://www.youtube.com/watch?v=${songId}`,
      );

      let thumbnails = response.video_details.thumbnails[3].url;
      if (!thumbnails) {
        if (response.video_details.thumbnails[2]) {
          thumbnails = response.video_details.thumbnails[2].url;
        } else {
          thumbnails = response.video_details.thumbnails[1].url ?? undefined;
        }
      }

      const rawSong: RawSong = {
        songId: response.video_details.id ?? songId,
        songName: response.video_details.title,
        duration: String(response.video_details.durationInSec),
        thumbnails,
      };

      return {
        isError: false,
        data: rawSong,
      };
    } catch (err) {
      return {
        isError: true,
        data: null,
        errorData: err,
      };
    }
  }

  public async getSognsInfoFromPlayList(url: string): Promise<APIResponse<RawSong[]>> {
    try {
      const rawPlayList: YouTubePlayList = await play.playlist_info(url, {
        incomplete: true,
      });

      const platlistData = await rawPlayList.all_videos();

      const playList: RawSong[] = [];
      platlistData.forEach((songData: YouTubeVideo) => {
        if (songData.id) {
          let thumbnails = songData.thumbnails[3].url;
          if (!thumbnails) {
            if (songData.thumbnails[2]) {
              thumbnails = songData.thumbnails[2].url;
            } else {
              thumbnails = songData.thumbnails[1].url ?? undefined;
            }
          }

          const newSong: RawSong = {
            songName: songData.title,
            songId: songData.id,
            duration: String(songData.durationInSec),
            thumbnails,
          };
          playList.push(newSong);
        }
      });

      return {
        isError: false,
        data: playList,
      };
    } catch (err) {
      return {
        isError: true,
        data: null,
        errorData: err,
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
