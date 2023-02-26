import { Service } from '../../shared/infrastructure/Service';
import { NewPlaylist } from '../domain/interfaces/newPlaylist';
import { Playlist } from '../domain/playlistEntity';

export class PlaylistService extends Service {
    private playlistRepository = this.dataSource.getRepository(Playlist);

    public async create(newPlaylist: NewPlaylist) {
        const playlist = this.playlistRepository.create(newPlaylist);
        return this.playlistRepository.save(playlist);
    }

    public getByNameAndAuthor(name: string, author: string): Promise<Playlist[]> {
        return this.playlistRepository.find({
            where: {
                name,
                author,
            },
        });
    }
}
