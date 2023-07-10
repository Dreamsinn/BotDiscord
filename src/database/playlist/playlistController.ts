import { ErrorEnum } from '../shared/domain/enums/ErrorEnum';
import { CreatePlaylist } from './aplication/createPlaylist';
import { DeletePlaylist } from './aplication/deletePlaylist';
import { GetPlaylistByAuthor } from './aplication/getPlaylistByAuthor';
import { GetPlaylistByAuthorAndName } from './aplication/getPlaylistByAuthorAndName';
import { UpdatePlaylist } from './aplication/updatePlaylist';
import { CreatePlaylistProps } from './domain/interfaces/createPlaylistProps';
import { UpdatePlaylistProps } from './domain/interfaces/updatePlaylistProps';
import { PlaylistDTO } from './domain/playlistDTO';
import { PlaylistService } from './infrastructure/playlistService';

export class PlaylistController {
    private createPlaylist: CreatePlaylist;
    private getPlaylistByAuthorAndName: GetPlaylistByAuthorAndName;
    private updatePlaylist: UpdatePlaylist;
    private getPlaylistByAuthor: GetPlaylistByAuthor;
    private deletePlaylist: DeletePlaylist;

    constructor(playlistService: PlaylistService) {
        this.createPlaylist = new CreatePlaylist(playlistService);
        this.getPlaylistByAuthorAndName = new GetPlaylistByAuthorAndName(playlistService);
        this.updatePlaylist = new UpdatePlaylist(playlistService);
        this.getPlaylistByAuthor = new GetPlaylistByAuthor(playlistService);
        this.deletePlaylist = new DeletePlaylist(playlistService);
    }

    public create(props: CreatePlaylistProps): Promise<PlaylistDTO | ErrorEnum> {
        return this.createPlaylist.call(props);
    }

    public getByAuthorAndName(author: string, name: string): Promise<PlaylistDTO | null> {
        return this.getPlaylistByAuthorAndName.call(author, name);
    }

    public update(props: UpdatePlaylistProps): Promise<PlaylistDTO | ErrorEnum> {
        return this.updatePlaylist.call(props);
    }

    public getByAuthor(author: string): Promise<PlaylistDTO[]> {
        return this.getPlaylistByAuthor.call(author);
    }

    public delete(playlistId: string): Promise<PlaylistDTO | ErrorEnum> {
        return this.deletePlaylist.call(playlistId);
    }
}
