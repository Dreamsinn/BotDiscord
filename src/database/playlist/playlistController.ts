import { ErrorEnum } from '../shared/domain/enums/ErrorEnum';
import { CreatePlaylist } from './aplication/createPlaylist';
import { GetPlaylistByAuthor } from './aplication/getPlaylistByAuthor';
import { GetPlaylistByAuthorAndName } from './aplication/getPlaylistByAuthorAndName';
import { UpdatePlaylist } from './aplication/updatePlaylist';
import { CreatePlaylistProps } from './domain/interfaces/createPlaylistProps';
import { UpdatePlaylistProps } from './domain/interfaces/updatePlaylistProps';
import { Playlist } from './domain/playlistEntity';
import { PlaylistService } from './infrastructure/playlistService';

export class PlaylistController {
    private createPlaylist: CreatePlaylist;
    private getPlaylistByAuthorAndName: GetPlaylistByAuthorAndName;
    private updatePlaylist: UpdatePlaylist;
    private getPlaylistByAuthor: GetPlaylistByAuthor;

    constructor(playlistService: PlaylistService) {
        this.createPlaylist = new CreatePlaylist(playlistService);
        this.getPlaylistByAuthorAndName = new GetPlaylistByAuthorAndName(playlistService);
        this.updatePlaylist = new UpdatePlaylist(playlistService);
        this.getPlaylistByAuthor = new GetPlaylistByAuthor(playlistService);
    }

    public create(props: CreatePlaylistProps): Promise<Playlist | ErrorEnum> {
        return this.createPlaylist.call(props);
    }

    public getByAuthorAndName(author: string, name: string): Promise<Playlist | null> {
        return this.getPlaylistByAuthorAndName.call(author, name);
    }

    public update(props: UpdatePlaylistProps): Promise<Playlist | ErrorEnum> {
        return this.updatePlaylist.call(props);
    }

    public getByAuthor(author: string): Promise<Playlist[]> {
        return this.getPlaylistByAuthor.call(author);
    }
}
