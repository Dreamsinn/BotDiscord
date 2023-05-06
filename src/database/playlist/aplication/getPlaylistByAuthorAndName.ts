import { PlaylistDTO } from '../domain/playlistDTO';
import { Playlist } from '../domain/playlistEntity';
import { PlaylistService } from '../infrastructure/playlistService';

export class GetPlaylistByAuthorAndName {
    private playlistService: PlaylistService;
    constructor(playlistService: PlaylistService) {
        this.playlistService = playlistService;
    }

    public async call(author: string, name: string): Promise<PlaylistDTO | null> {
        const playlist: Playlist | null = await this.playlistService.getByNameAndAuthor(name, author);

        if (!playlist) {
            return playlist;
        }

        return new PlaylistDTO(playlist);
    }
}
