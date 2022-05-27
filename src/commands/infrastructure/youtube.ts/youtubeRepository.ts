export abstract class YoutubeSearchRepository {
    abstract searchSongByName(song: string);
    abstract searchSongByURL(songId: string);
}