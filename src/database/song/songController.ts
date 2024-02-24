import { SongData } from '../../commands/domain/interfaces/song';
import { CreateSong } from './aplication/createSong';
import { GetSongsById } from './aplication/getSongById';
import { SongDTO } from './domain/SongDTO';
import { SongService } from './infrastructure/songService';

export class SongController {
  private createSong: CreateSong;
  private getSongById: GetSongsById;

  constructor(songService: SongService) {
    this.createSong = new CreateSong(songService);
    this.getSongById = new GetSongsById(songService);
  }

  public create(songData: SongData | SongData[]): Promise<SongDTO[]> {
    return this.createSong.call(songData);
  }

  public getById(songId: string | string[]): Promise<SongDTO[]> {
    return this.getSongById.call(songId);
  }
}
