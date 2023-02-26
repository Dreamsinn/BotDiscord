import { SongData } from '../../commands/domain/interfaces/song';
import { CreateSong } from './aplication/createSong';
import { GetSongById } from './aplication/getSongById';
import { Song } from './domain/songEntity';
import { SongService } from './infrastructure/songService';

export class SongController {
    private createSong: CreateSong;
    private getSongById: GetSongById;

    constructor(songService: SongService) {
        this.createSong = new CreateSong(songService);
        this.getSongById = new GetSongById(songService);
    }

    public create(songData: SongData | SongData[]): Promise<Song[]> {
        return this.createSong.call(songData);
    }

    public getById(songId: string | string[]): Promise<Song[]> {
        return this.getSongById.call(songId);
    }
}
