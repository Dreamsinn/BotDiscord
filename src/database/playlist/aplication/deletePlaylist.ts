import { ErrorEnum } from '../../shared/domain/enums/ErrorEnum';
import { PlaylistDTO } from '../domain/playlistDTO';
import { PlaylistService } from '../infrastructure/playlistService';

export class DeletePlaylist {
    private playlistService: PlaylistService;
    constructor(playlistService: PlaylistService) {
        this.playlistService = playlistService;
    }

    public async call(playlistId: string): Promise<PlaylistDTO | ErrorEnum> {
        const playlist = await this.playlistService.getById(playlistId);

        if (playlist) {
            return new PlaylistDTO(await this.playlistService.remove(playlist));
        }

        return ErrorEnum.NotFound;
    }
}
