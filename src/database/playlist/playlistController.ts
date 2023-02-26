import { ErrorEnum } from '../shared/domain/enums/ErrorEnum';
import { CreatePlaylist } from './aplication/createPlaylist';
import { CreatePlaylistProps } from './domain/interfaces/createPlaylistProps';
import { Playlist } from './domain/playlistEntity';
import { PlaylistService } from './infrastructure/playlistService';

export class PlaylistController {
    private createPlaylist: CreatePlaylist;
    constructor(playlistService: PlaylistService) {
        this.createPlaylist = new CreatePlaylist(playlistService);
    }

    public create(props: CreatePlaylistProps): Promise<Playlist | ErrorEnum> {
        return this.createPlaylist.call(props);
    }
}
