import { SongService } from '../infrastructure/songService';

export class GetSongByYoutubeId {
    private songService: SongService;
    constructor(songService: SongService) {
        this.songService = songService;
    }

    public async call(youtubeId: string | string[]) {
        if (!(youtubeId instanceof Array)) {
            youtubeId = [youtubeId];
        }

        const mappedYoutubeId = youtubeId.map((id: string) => {
            return { YouTubeId: id };
        });

        return this.songService.getByYoutbeId(mappedYoutubeId);
    }
}
