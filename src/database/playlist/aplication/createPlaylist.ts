import { ErrorEnum } from '../../shared/domain/enums/ErrorEnum';
import { CreatePlaylistProps } from '../domain/interfaces/createPlaylistProps';
import { NewPlaylist } from '../domain/interfaces/newPlaylist';
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
        privatePl,
        name,
    }: CreatePlaylistProps): Promise<Playlist | ErrorEnum> {
        const playlist = await this.playlistService.getByNameAndAuthor(name, author);

        if (playlist.length) {
            return ErrorEnum.BadRequest;
        }

        const newPlaylist: NewPlaylist = {
            name,
            songsId: String(songsId),
            privatePl,
            author: author,
        };

        return this.playlistService.create(newPlaylist);
    }
}
