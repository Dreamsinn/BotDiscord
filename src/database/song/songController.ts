import { SongData } from '../../commands/domain/interfaces/song';
import { CreateSong } from './aplication/createSong';
import { Song } from './domain/songEntity';
import { SongService } from './infrastructure/songService';

export class SongController {
    private createSong: CreateSong;

    constructor(songService: SongService) {
        this.createSong = new CreateSong(songService);
    }

    public create(songData: SongData | SongData[]): Promise<Song[]> {
        return this.createSong.call(songData);
    }
}
