export abstract class PlayDlRepository {
    abstract searchSongByName(argument: string);
    abstract getSongInfo(songId: string);
    abstract getSognsInfoFromPlayList(url: string)
    abstract getSongStream(songId: string);
}