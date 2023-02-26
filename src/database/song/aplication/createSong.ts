import { SongData } from '../../../commands/domain/interfaces/song';
import { NewSong } from '../domain/interface/newSong';
import { Song } from '../domain/songEntity';
import { SongService } from '../infrastructure/songService';

export class CreateSong {
    private songService: SongService;
    constructor(songService: SongService) {
        this.songService = songService;
    }

    public async call(songData: SongData | SongData[]): Promise<Song[]> {
        if (!(songData instanceof Array)) {
            songData = [songData];
        }

        const newSongArray = this.mapSongArray(songData);
        return this.songService.create(newSongArray);
    }

    private mapSongArray(songList: SongData[]): NewSong[] {
        const mapedSongs: NewSong[] = songList.map((song: SongData) => {
            const newSong: NewSong = {
                YouTubeId: song.songId,
                name: song.songName,
                durationHours: song.duration.hours,
                durationMinutes: song.duration.minutes,
                durationSeconds: song.duration.seconds,
                durationString: song.duration.string,
                thumbnail: song.thumbnails,
            };
            return newSong;
        });

        return mapedSongs;
    }
}
