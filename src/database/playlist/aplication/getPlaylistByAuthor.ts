import { PlaylistDTO } from '../domain/playlistDTO';
import { Playlist } from '../domain/playlistEntity';
import { PlaylistService } from '../infrastructure/playlistService';

export class GetPlaylistByAuthor {
    private playlistService: PlaylistService;
    constructor(playlistService: PlaylistService) {
        this.playlistService = playlistService;
    }

    public async call(author: string): Promise<PlaylistDTO[]> {
        const playlistArray: Playlist[] = await this.playlistService.getByAuthor(author);

        const playlistDTOArray: PlaylistDTO[] = playlistArray.map((playlist: Playlist) => {
            return new PlaylistDTO(playlist);
        });

        return playlistDTOArray;
    }
}
