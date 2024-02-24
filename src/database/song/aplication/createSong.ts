import { SongData } from '../../../commands/domain/interfaces/song';
import { NewSong } from '../domain/interface/newSong';
import { SongDTO } from '../domain/SongDTO';
import { Song } from '../domain/songEntity';
import { SongService } from '../infrastructure/songService';

export class CreateSong {
  private songService: SongService;
  constructor(songService: SongService) {
    this.songService = songService;
  }

  public async call(songData: SongData | SongData[]): Promise<SongDTO[]> {
    if (!(songData instanceof Array)) {
      songData = [songData];
    }

    // find song in db with the same youtube id of any song in songData
    const alreadyCreatedSongs = await this.findAlreadyCreatedSongs(songData);

    const newSongArray = this.mapSongsAndRemoveAlreadyCreatedOnes(
      songData,
      alreadyCreatedSongs,
    );

    const newCreatedSongs: Song[] = await this.songService.create(newSongArray);

    return newCreatedSongs.map((song: Song) => {
      return new SongDTO(song);
    });
  }

  private async findAlreadyCreatedSongs(songArray: SongData[]): Promise<Song[]> {
    const mappedSongId = songArray.map((song: SongData) => {
      return { id: song.songId };
    });

    return this.songService.getByYoutbeId(mappedSongId);
  }

  private mapSongsAndRemoveAlreadyCreatedOnes(
    songArray: SongData[],
    alreadyCreatedSongs: Song[],
  ): NewSong[] {
    const mapedSongs: NewSong[] = songArray.flatMap((song: SongData) => {
      // if not created already map it
      if (
        !alreadyCreatedSongs.some((createdSong: Song) => song.songId === createdSong.id)
      ) {
        const newSong: NewSong = {
          id: song.songId,
          name: song.songName,
          durationHours: song.duration.hours,
          durationMinutes: song.duration.minutes,
          durationSeconds: song.duration.seconds,
          durationString: song.duration.string,
          thumbnail: song.thumbnails,
        };
        return newSong;
      }
      return [];
    });

    return mapedSongs;
  }
}
