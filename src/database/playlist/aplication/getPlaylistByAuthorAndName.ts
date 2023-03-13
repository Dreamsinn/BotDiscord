import { Playlist } from '../domain/playlistEntity';
import { PlaylistService } from '../infrastructure/playlistService';

export class GetPlaylistByAuthorAndName {
    private playlistService: PlaylistService;
    constructor(playlistService: PlaylistService) {
        this.playlistService = playlistService;
    }

    public async call(author: string, name: string): Promise<Playlist | null> {
        return this.playlistService.getByNameAndAuthor(name, author);
    }
}
