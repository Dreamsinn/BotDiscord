import { ErrorEnum } from '../../shared/domain/enums/ErrorEnum';
import { Playlist } from '../domain/playlistEntity';
import { PlaylistService } from '../infrastructure/playlistService';

export class DeletePlaylist {
    private playlistService: PlaylistService;
    constructor(playlistService: PlaylistService) {
        this.playlistService = playlistService;
    }

    public async call(playlistId: string): Promise<Playlist | ErrorEnum> {
        const playlist = await this.playlistService.getById(playlistId);

        if (playlist) {
            return this.playlistService.remove(playlist);
        }

        return ErrorEnum.NotFound;
    }
}
