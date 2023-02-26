import { SongData } from '../../commands/domain/interfaces/song';
import { CreateSong } from './aplication/createSong';
import { GetSongByYoutubeId } from './aplication/getSongByYoutubeId';
import { Song } from './domain/songEntity';
import { SongService } from './infrastructure/songService';

export class SongController {
    private createSong: CreateSong;
    private getSongByYoutubeId: GetSongByYoutubeId;

    constructor(songService: SongService) {
        this.createSong = new CreateSong(songService);
        this.getSongByYoutubeId = new GetSongByYoutubeId(songService);
    }

    public create(songData: SongData | SongData[]): Promise<Song[]> {
        return this.createSong.call(songData);
    }

    public getByYoutubeId(youtubeId: string | string[]): Promise<Song[]> {
        return this.getSongByYoutubeId.call(youtubeId);
    }
}
