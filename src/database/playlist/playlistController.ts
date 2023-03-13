import { ErrorEnum } from '../shared/domain/enums/ErrorEnum';
import { CreatePlaylist } from './aplication/createPlaylist';
import { GetPlaylistByAuthorAndName } from './aplication/getPlaylistByAuthorAndName';
import { CreatePlaylistProps } from './domain/interfaces/createPlaylistProps';
import { Playlist } from './domain/playlistEntity';
import { PlaylistService } from './infrastructure/playlistService';

export class PlaylistController {
    private createPlaylist: CreatePlaylist;
    private getPlaylistByAuthorAndName: GetPlaylistByAuthorAndName;
    constructor(playlistService: PlaylistService) {
        this.createPlaylist = new CreatePlaylist(playlistService);
        this.getPlaylistByAuthorAndName = new GetPlaylistByAuthorAndName(playlistService);
    }

    public create(props: CreatePlaylistProps): Promise<Playlist | ErrorEnum> {
        return this.createPlaylist.call(props);
    }

    public getByAuthorAndName(author: string, name: string): Promise<Playlist | null> {
        return this.getPlaylistByAuthorAndName.call(author, name);
    }
}
