export abstract class YoutubeSearchRepository {
    abstract searchSongByName(song: string, event: any);
    abstract searchPlaylist(playListId: string)
    abstract searchSongById(songId: string);
}