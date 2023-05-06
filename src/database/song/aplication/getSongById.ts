import { SongDTO } from '../domain/SongDTO';
import { Song } from '../domain/songEntity';
import { SongService } from '../infrastructure/songService';

export class GetSongsById {
    private songService: SongService;
    constructor(songService: SongService) {
        this.songService = songService;
    }

    public async call(songId: string | string[]): Promise<SongDTO[]> {
        if (!(songId instanceof Array)) {
            songId = [songId];
        }

        const mappedId = songId.map((id: string) => {
            return { id };
        });

        const songs: Song[] = await this.songService.getByYoutbeId(mappedId);

        return songs.map((song: Song) => {
            return new SongDTO(song);
        });
    }
}
