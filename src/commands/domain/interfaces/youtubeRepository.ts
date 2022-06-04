export abstract class YoutubeSearchRepository {
    abstract searchSongByName(song: string, event: any);
    abstract searchSongById(songId: string);
}