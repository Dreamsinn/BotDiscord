import { Service } from '../../shared/infrastructure/Service';
import { NewSong } from '../domain/interface/newSong';
import { Song } from '../domain/songEntity';

export class SongService extends Service {
    private serverRepository = this.dataSource.getRepository(Song);

    public async create(newSong: NewSong[]): Promise<Song[]> {
        const song = this.serverRepository.create(newSong);
        return this.serverRepository.save(song);
    }

    public async getByYoutbeId(youtubeIdList: { YouTubeId: string }[]): Promise<Song[]> {
        return this.serverRepository.find({ where: youtubeIdList });
    }
}
