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

        // find song in db with the same youtube id of any song in songData
        const alreadyCreatedSongs = await this.finAlreadyCreatedSongs(songData);

        const newSongArray = this.mapSongArray(songData, alreadyCreatedSongs);
        return this.songService.create(newSongArray);
    }

    private async finAlreadyCreatedSongs(songArray: SongData[]): Promise<Song[]> {
        const mappedYoutubeId = songArray.map((song: SongData) => {
            return { YouTubeId: song.songId };
        });

        return this.songService.getByYoutbeId(mappedYoutubeId);
    }

    private mapSongArray(songArray: SongData[], alreadyCreatedSongs: Song[]): NewSong[] {
        const mapedSongs: NewSong[] = songArray.flatMap((song: SongData) => {
            // if not created already map it
            if (
                !alreadyCreatedSongs.some((createdSong: Song) => song.songId === createdSong.YouTubeId)
            ) {
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
            }
            return [];
        });

        return mapedSongs;
    }
}
