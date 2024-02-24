import { Service } from '../../shared/infrastructure/service';
import { NewSong } from '../domain/interface/newSong';
import { Song } from '../domain/songEntity';

export class SongService extends Service {
  private serverRepository = this.dataSource.getRepository(Song);

  public async create(newSong: NewSong[]): Promise<Song[]> {
    const song = this.serverRepository.create(newSong);
    return this.serverRepository.save(song);
  }

  public async getByYoutbeId(songIdList: { id: string }[]): Promise<Song[]> {
    return this.serverRepository.find({ where: songIdList });
  }
}
