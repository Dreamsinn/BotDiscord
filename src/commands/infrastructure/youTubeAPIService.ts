import axios from 'axios';
import { APIResponse } from '../domain/interfaces/APIResponse';
import { RawSong } from '../domain/interfaces/song';
import { YoutubeAPI } from '../domain/interfaces/youtubeAPI';

export class YouTubeAPIService implements YoutubeAPI {
  public async searchSongByName(
    song: string,
    maxResults = 9,
  ): Promise<APIResponse<RawSong[]>> {
    const order = 'relevance';
    const part = 'snippet';
    const type = 'video';

    try {
      const searched = await axios.get(
        `https://www.googleapis.com/youtube/v3/search?key=${process.env.API_KEY_YOUTUBE}&order=${order}&part=${part}&maxResults=${maxResults}&type=${type}&q=${song}`,
      );

      const response: RawSong[] = searched.data.items.map((songData: any) => {
        const newSong: RawSong = {
          songId: songData.id.videoId,
          songName: songData.snippet.title,
        };

        return newSong;
      });

      return {
        isError: false,
        data: response,
      };
    } catch (err) {
      return {
        isError: true,
        data: null,
        errorData: err.response?.data ?? err,
      };
    }
  }

  public async searchPlaylist(playListId: string): Promise<APIResponse<string>> {
    const part = 'snippet';
    const playlistId = playListId;
    const maxResults = '50';

    try {
      const searched: any = await axios.get(
        `https://youtube.googleapis.com/youtube/v3/playlistItems?part=${part}&playlistId=${playlistId}&key=${process.env.API_KEY_YOUTUBE}&maxResults=${maxResults}`,
      );

      const songsId: string[] = searched.data.items.map((songData: any) => {
        return songData.snippet.resourceId.videoId;
      });

      return {
        isError: false,
        data: String(songsId),
      };
    } catch (err) {
      return {
        isError: true,
        data: null,
        errorData: err.response?.data ?? err,
      };
    }
  }

  public async searchSongById(songsId: string): Promise<APIResponse<RawSong[]>> {
    const part = 'snippet,contentDetails';
    const maxResults = '1';
    // id can be an id or ids splited by ' , '
    const id = songsId;

    try {
      const searched = await axios.get(
        `https://www.googleapis.com/youtube/v3/videos?key=${process.env.API_KEY_YOUTUBE}&part=${part}&maxResults=${maxResults}&id=${id}`,
      );

      const response: RawSong[] = searched.data.items.map((song: any) => {
        const newSong: RawSong = {
          songId: song.id,
          songName: song.snippet.title,
          duration: song.contentDetails.duration,
          thumbnails: song.snippet.thumbnails.medium.url,
        };

        return newSong;
      });

      return {
        isError: false,
        data: response,
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
