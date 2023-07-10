import { ErrorEnum } from '../../shared/domain/enums/ErrorEnum';
import { UpdatePlaylistProps } from '../domain/interfaces/updatePlaylistProps';
import { PlaylistDTO } from '../domain/playlistDTO';
import { PlaylistService } from '../infrastructure/playlistService';

export class UpdatePlaylist {
    private playlistService: PlaylistService;
    constructor(playlistService: PlaylistService) {
        this.playlistService = playlistService;
    }

    public async call({
        id,
        name,
        songsId,
        updatedBy,
    }: UpdatePlaylistProps): Promise<PlaylistDTO | ErrorEnum> {
        if (!name && !songsId) {
            return ErrorEnum.BadRequest;
        }

        const playlist = await this.playlistService.getById(id);

        if (!playlist) {
            return ErrorEnum.NotFound;
        }

        if (name) {
            const playlistWithSameName = await this.playlistService.getByNameAndAuthor(
                name,
                playlist.author,
            );

            if (playlistWithSameName) {
                return ErrorEnum.BadRequest;
            }

            playlist.name = name;
        }

        if (songsId) {
            playlist.songsId = String(songsId);
        }

        playlist.updatedBy = updatedBy;

        const updatedAt = new Date();
        playlist.updatedAt = updatedAt;

        const updatedPlaylist = await this.playlistService.update(playlist);

        return new PlaylistDTO(updatedPlaylist);
    }
}
