import { Service } from '../../shared/infrastructure/Service';
import { NewPlaylist } from '../domain/interfaces/newPlaylist';
import { Playlist } from '../domain/playlistEntity';

export class PlaylistService extends Service {
    private playlistRepository = this.dataSource.getRepository(Playlist);

    public async create(newPlaylist: NewPlaylist) {
        const playlist = this.playlistRepository.create(newPlaylist);
        return this.playlistRepository.save(playlist);
    }

    public async getByNameAndAuthor(name: string, author: string): Promise<Playlist | null> {
        return this.playlistRepository.findOne({
            where: {
                name,
                author,
            },
        });
    }

    public async getById(id: string): Promise<Playlist | null> {
        return this.playlistRepository.findOne({ where: { id } });
    }

    public async update(paylist: Playlist): Promise<Playlist> {
        return this.playlistRepository.save(paylist);
    }
}
