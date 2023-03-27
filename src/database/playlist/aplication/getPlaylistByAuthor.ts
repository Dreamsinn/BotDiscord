import { Playlist } from '../domain/playlistEntity';
import { PlaylistService } from '../infrastructure/playlistService';

export class GetPlaylistByAuthor {
    private playlistService: PlaylistService;
    constructor(playlistService: PlaylistService) {
        this.playlistService = playlistService;
    }

    public async call(author: string): Promise<Playlist[]> {
        return this.playlistService.getByAuthor(author);
    }
}
