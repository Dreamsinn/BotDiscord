import { ErrorEnum } from '../../shared/domain/enums/ErrorEnum';
import { CreatePlaylistProps } from '../domain/interfaces/createPlaylistProps';
import { NewPlaylist } from '../domain/interfaces/newPlaylist';
import { PlaylistDTO } from '../domain/playlistDTO';
import { Playlist } from '../domain/playlistEntity';
import { PlaylistService } from '../infrastructure/playlistService';

export class CreatePlaylist {
    private playlistService: PlaylistService;
    constructor(playlistService: PlaylistService) {
        this.playlistService = playlistService;
    }

    public async call({
        songsId,
        author,
        createdBy,
        privatePl,
        name,
    }: CreatePlaylistProps): Promise<PlaylistDTO | ErrorEnum> {
        const playlist = await this.playlistService.getByNameAndAuthor(name, author);

        if (playlist) {
            return ErrorEnum.BadRequest;
        }

        const newPlaylist: NewPlaylist = {
            name,
            songsId: String(songsId),
            privatePl,
            author: author,
            createdBy: createdBy,
        };

        const createdPlaylist: Playlist = await this.playlistService.create(newPlaylist);

        return new PlaylistDTO(createdPlaylist);
    }
}
