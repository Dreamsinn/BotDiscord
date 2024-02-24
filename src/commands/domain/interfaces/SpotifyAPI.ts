import { APIResponse } from './APIResponse';
import { SpotifyRawSong } from './song';

export abstract class SpotifyAPI {
  protected abstract token: string | undefined;
  protected abstract getToken(): Promise<void>;
  abstract getSongsDataFromSpotifyPlaylistId(
    playListId: string,
  ): Promise<APIResponse<SpotifyRawSong[]>>;
  abstract getSongDataFromSpotifyId(
    songId: string,
  ): Promise<APIResponse<SpotifyRawSong[]>>;
}
