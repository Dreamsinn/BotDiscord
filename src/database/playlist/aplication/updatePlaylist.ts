import { ErrorEnum } from '../../shared/domain/enums/ErrorEnum';
import { UpdatePlaylistProps } from '../domain/interfaces/updatePlaylistProps';
import { Playlist } from '../domain/playlistEntity';
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
    }: UpdatePlaylistProps): Promise<Playlist | ErrorEnum> {
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
            console.log({ playlistWithSameName });
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

        return this.playlistService.update(playlist);
    }
}
