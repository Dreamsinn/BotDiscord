export abstract class PlayDlRepository {

    abstract searchSongByName(argument: string);
    abstract getSongInfo(songId: string);
    abstract getSongStream(songId: string);
}