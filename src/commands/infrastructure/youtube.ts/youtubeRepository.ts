export abstract class YoutubeSearchRepository {
    abstract searchSongByName(song: string);
    abstract searchSongById(songId: string);
}