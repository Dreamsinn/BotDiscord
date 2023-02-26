import { SongService } from '../infrastructure/songService';

export class GetSongById {
    private songService: SongService;
    constructor(songService: SongService) {
        this.songService = songService;
    }

    public async call(songId: string | string[]) {
        if (!(songId instanceof Array)) {
            songId = [songId];
        }

        const mappedId = songId.map((id: string) => {
            return { id };
        });

        return this.songService.getByYoutbeId(mappedId);
    }
}
