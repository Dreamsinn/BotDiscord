import { Message } from 'discord.js';
import { YouTubeVideo } from 'play-dl';
import { UsersUsingACommand } from '../../aplication/utils/usersUsingACommand';
import { PlayDlService } from '../../infrastructure/playDlService';
import { SpotifyAPIService } from '../../infrastructure/spotifyAPIService';
import { YouTubeAPIService } from '../../infrastructure/youTubeAPIService';
import { APIResponse } from './APIResponse';
import { MusicAPIs } from './musicAPIs';
import { RawSong, Song, SpotifyRawSong } from './song';

export abstract class PlayCommand {
    protected youtubeAPIService: YouTubeAPIService;
    protected playDlService: PlayDlService;
    protected spotifyService: SpotifyAPIService;

    constructor({ youtubeAPI, playDlAPI, spotifyAPI }: MusicAPIs) {
        this.youtubeAPIService = youtubeAPI;
        this.playDlService = playDlAPI;
        this.spotifyService = spotifyAPI;
    }

    abstract call(
        event: Message,
        argument: string,
        usersUsingACommand?: UsersUsingACommand,
    ): Promise<Song | Song[] | void>;

    protected async findSongIdFromYoutubeURL(event: Message, url: string): Promise<Song | void> {
        // encontramos la id del video
        const rawSongId = url
            .replace('https://', '')
            .replace('www.', '')
            .replace('youtube.com/watch?v=', '')
            .replace(/^./, '');

        const URLParametersPosition = rawSongId.indexOf('&');

        if (URLParametersPosition === -1) {
            const songId: string = rawSongId;
            const songData = await this.mapSongData(event, songId);
            if (!songData) {
                return;
            }
            return songData[0];
        }

        const songId: string = rawSongId.substring(0, URLParametersPosition);

        const songData = await this.mapSongData(event, songId);
        if (!songData) {
            return;
        }
        return songData[0];
    }

    protected isSongData(argument: Song | void): argument is Song {
        return (argument as Song).duration?.string !== undefined;
    }

    protected async mapSongData(event: Message, songsId: string): Promise<Song[] | void> {
        // optenemos duracion y nombre
        // llama primero a Play-dl y si falla a Youtube API para no gastar el token
        const playDlResponse: APIResponse<YouTubeVideo> = await this.playDlService.getSongInfo(songsId);
        if (!playDlResponse.isError) {
            const song: Song = {
                songId: songsId,
                songName: playDlResponse.data.title,
                duration: this.parseSongDuration(String(playDlResponse.data.durationInSec), true),
                thumbnails: playDlResponse.data.thumbnails[3].url,
            };
            return [song];
        }

        console.log(`Play-dl getSongInfo Error: ${playDlResponse.errorData}`);

        // si falla play-dl la llamamos a la api de google, para que sea mas dificil llegar al limite
        const youtubeResponse: APIResponse<RawSong[]> = await this.youtubeAPIService.searchSongById(
            songsId,
        );

        if (!youtubeResponse.isError) {
            const songsData: Song[] = youtubeResponse.data.map((rawSong: RawSong) => {
                const song: Song = {
                    songId: rawSong.songId,
                    songName: rawSong.songName,
                    duration: this.parseSongDuration(rawSong.duration, false),
                    thumbnails: rawSong.thumbnails,
                };
                return song;
            });
            return songsData;
        }

        event.channel.send(`It has not been possible to get song's information`);
        console.log(`YoutubeAPI getSongInfo Error: ${youtubeResponse.errorData}`);
        return;
    }

    protected async mapSpotifySongData(rawSong: SpotifyRawSong): Promise<Song> {
        const songId = await this.getYoutubeIdFromSpotyId(rawSong);
        if (songId) {
            const song: Song = {
                songId,
                songName: rawSong.songName,
                duration: this.parseSongDuration(String(rawSong.duration), true),
                thumbnails: rawSong.thumbnails,
            };
            return song;
        }
    }

    private async getYoutubeIdFromSpotyId(rawSong: SpotifyRawSong): Promise<string | void> {
        const search = rawSong.songAuthor + ' ' + rawSong.songName;

        const playDlResponse = await this.playDlService.searchSongByName(search, 1);
        if (!playDlResponse.isError) {
            return playDlResponse.data[0].songId;
        }
        console.log(`PlayDl get songId by name and artist  Error: ${playDlResponse.errorData}`);

        const youtubeResponse = await this.youtubeAPIService.searchSongByName(search, 1);
        if (!youtubeResponse.isError) {
            return youtubeResponse.data[0].songId;
        }
        console.log(`PlayDl get songId by name and artist  Error: ${playDlResponse.errorData}`);
        return;
    }

    protected parseSongDuration(durationString = '', onlySeconds: boolean): Song['duration'] {
        if (onlySeconds) {
            // si cojemos la de play-dl, lo pasamos al formato de la respuesta de youtube
            const duration = Number(durationString);
            const hours = Math.floor(duration / 3600);
            const minutes = Math.floor((duration % 3600) / 60);
            const seconds = Math.floor((duration % 3600) % 60);

            durationString = `${hours}H${minutes}M${seconds}S`;

            if (hours === 0) {
                durationString = `${minutes}M${seconds}S`;
            }

            if (minutes === 0 && hours === 0) {
                durationString = `${seconds}S`;
            }
        }
        const duration = { hours: 0, minutes: 0, seconds: 0, string: '' };
        const durationParts = durationString
            .replace('PT', '')
            .replace('H', ':')
            .replace('M', ':')
            .replace('S', '')
            .split(':');

        if (durationParts.length === 3) {
            duration.hours = Number(durationParts[0]);
            duration.minutes = Number(durationParts[1]);
            duration.seconds = Number(durationParts[2]);
            duration.string = `${duration.hours}h${duration.minutes}m${duration.seconds}s`;
        }

        if (durationParts.length === 2) {
            duration.minutes = Number(durationParts[0]);
            duration.seconds = Number(durationParts[1]);
            duration.string = `${duration.minutes}m${duration.seconds}s`;
        }

        if (durationParts.length === 1) {
            duration.seconds = Number(durationParts[0]);
            duration.string = `${duration.seconds}s`;
        }

        return duration;
    }
}
