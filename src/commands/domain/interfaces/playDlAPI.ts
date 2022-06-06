import { SoundCloudStream, YouTubeStream, YouTubeVideo } from "play-dl";
import { rawSongData } from "./songData";

export abstract class PlayDlAPI {
    abstract searchSongByName(argument: string): Promise<rawSongData[]>;
    abstract getSongInfo(songId: string): Promise<YouTubeVideo>;
    abstract getSognsInfoFromPlayList(url: string): Promise<rawSongData[]>;
    abstract getSongStream(songId: string): Promise<YouTubeStream | SoundCloudStream>;
}