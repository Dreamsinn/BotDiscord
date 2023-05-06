import { Song } from './songEntity';

export class SongDTO {
    readonly id: string; //youtube id
    readonly name: string;
    readonly duration: {
        hours: number;
        minutes: number;
        seconds: number;
        string: string;
    };
    readonly thumbnail: string;

    constructor(song: Song) {
        this.id = song.id;
        this.name = song.name;
        this.duration = {
            hours: song.durationHours,
            minutes: song.durationMinutes,
            seconds: song.durationSeconds,
            string: song.durationString,
        };
        this.thumbnail = song.thumbnail;
    }
}
