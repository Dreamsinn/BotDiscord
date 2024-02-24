import { Message } from 'discord.js';
import { UsersUsingACommand } from '../../aplication/utils/usersUsingACommand';
import { PlayDlService } from '../../infrastructure/playDlService';
import { SpotifyAPIService } from '../../infrastructure/spotifyAPIService';
import { YouTubeAPIService } from '../../infrastructure/youTubeAPIService';
import { APIResponse } from './APIResponse';
import { MusicAPIs } from './musicAPIs';
import { RawSong, SongData, SpotifyRawSong } from './song';

export abstract class PlayCommand {
  protected youtubeAPIService: YouTubeAPIService;
  protected playDlService: PlayDlService;
  protected spotifyService: SpotifyAPIService;

  constructor({ youtubeAPI, playDlAPI, spotifyAPI }: MusicAPIs) {
    this.youtubeAPIService = youtubeAPI;
    this.playDlService = playDlAPI;
    this.spotifyService = spotifyAPI;
  }

  abstract call(
    event: Message,
    argument: string,
    usersUsingACommand?: UsersUsingACommand,
  ): Promise<SongData | SongData[] | void>;

  protected async findSongIdFromYoutubeURL(
    event: Message,
    url: string,
  ): Promise<SongData | void> {
    // encontramos la id del video
    const rawSongId = url
      .replace('https://', '')
      .replace('www.', '')
      .replace('youtube.com/watch?v=', '')
      .replace(/^./, '');

    const URLParametersPosition = rawSongId.indexOf('&');

    let songId = rawSongId;
    if (URLParametersPosition !== -1) {
      songId = rawSongId.substring(0, URLParametersPosition);
    }

    const songData = await this.mapSongData(event, songId);
    if (!songData) {
      return;
    }
    return songData;
  }

  protected isSongData(argument: SongData | void): argument is SongData {
    return (argument as SongData).duration?.string !== undefined;
  }

  protected async mapSongData(event: Message, songId: string): Promise<SongData | void> {
    // llama primero a Play-dl y si falla a Youtube API para no gastar el token
    const playDlResponse: APIResponse<RawSong> =
      await this.playDlService.getSongInfo(songId);
    if (!playDlResponse.isError) {
      const song: SongData = {
        songId: playDlResponse.data.songId,
        songName:
          playDlResponse.data.songName ?? "It has not been possible to get song's title",
        duration: this.parseSongDuration(playDlResponse.data.duration, true),
        thumbnails: playDlResponse.data.thumbnails ?? '',
      };
      return song;
    }

    console.log(`Play-dl getSongInfo Error: ${playDlResponse.errorData}`);

    // si falla play-dl la llamamos a la api de google, para que sea mas dificil llegar al limite
    const youtubeResponse: APIResponse<RawSong[]> =
      await this.youtubeAPIService.searchSongById(songId);

    if (!youtubeResponse.isError) {
      if (youtubeResponse.data.length) {
        const song: SongData = {
          songId: youtubeResponse.data[0].songId,
          songName:
            youtubeResponse.data[0].songName ??
            "It has not been possible to get song's title",
          duration: this.parseSongDuration(youtubeResponse.data[0].duration, false),
          thumbnails: youtubeResponse.data[0].thumbnails ?? '',
        };
        return song;
      }
    } else {
      console.log(`YoutubeAPI getSongInfo Error: ${youtubeResponse.errorData}`);
    }
    event.channel.send(`It has not been possible to get song's information`);
    return;
  }

  protected async mapSpotifySongData(rawSong: SpotifyRawSong): Promise<SongData | void> {
    const songId = await this.getYoutubeIdFromSpotyId(rawSong);
    if (songId) {
      const song: SongData = {
        songId,
        songName: rawSong.songName,
        duration: this.parseSongDuration(String(rawSong.duration), true),
        thumbnails: rawSong.thumbnails,
      };
      return song;
    }
  }

  private async getYoutubeIdFromSpotyId(rawSong: SpotifyRawSong): Promise<string | void> {
    const search = rawSong.songAuthor + ' ' + rawSong.songName;

    const playDlResponse = await this.playDlService.searchSongByName(search, 1);
    if (!playDlResponse.isError) {
      return playDlResponse.data[0].songId;
    }
    console.log(
      `PlayDl get songId by name and artist  Error: ${playDlResponse.errorData}`,
    );

    const youtubeResponse = await this.youtubeAPIService.searchSongByName(search, 1);
    if (!youtubeResponse.isError) {
      if (youtubeResponse.data.length) {
        return youtubeResponse.data[0].songId;
      }
    } else {
      console.log(
        `PlayDl get songId by name and artist  Error: ${playDlResponse.errorData}`,
      );
    }

    return;
  }

  protected parseSongDuration(
    durationString = '',
    onlySeconds: boolean,
  ): SongData['duration'] {
    if (onlySeconds) {
      // si cojemos la de play-dl, lo pasamos al formato de la respuesta de youtube
      const duration = Number(durationString);
      const hours = Math.floor(duration / 3600);
      const minutes = Math.floor((duration % 3600) / 60);
      const seconds = Math.floor((duration % 3600) % 60);

      durationString = `${hours}H${minutes}M${seconds}S`;

      if (hours === 0) {
        durationString = `${minutes}M${seconds}S`;
      }

      if (minutes === 0 && hours === 0) {
        durationString = `${seconds}S`;
      }
    }
    const duration = { hours: 0, minutes: 0, seconds: 0, string: '' };
    const durationParts = durationString
      .replace('PT', '')
      .replace('H', ':')
      .replace('M', ':')
      .replace('S', '')
      .split(':');

    if (durationParts.length === 3) {
      duration.hours = Number(durationParts[0]);
      duration.minutes = Number(durationParts[1]);
      duration.seconds = Number(durationParts[2]);
      duration.string = `${duration.hours}h${duration.minutes}m${duration.seconds}s`;
    }

    if (durationParts.length === 2) {
      duration.minutes = Number(durationParts[0]);
      duration.seconds = Number(durationParts[1]);
      duration.string = `${duration.minutes}m${duration.seconds}s`;
    }

    if (durationParts.length === 1) {
      duration.seconds = Number(durationParts[0]);
      duration.string = `${duration.seconds}s`;
    }

    return duration;
  }
}
