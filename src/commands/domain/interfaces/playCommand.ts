import { Message } from 'discord.js';
import { YouTubeVideo } from 'play-dl';
import { UsersUsingACommand } from '../../aplication/utils/usersUsingACommand';
import { PlayDlHandler } from '../../infrastructure/playDlHandler';
import { YoutubeAPIHandler } from '../../infrastructure/youtubeHandler';
import { APIResponse } from './APIResponse';
import { RawSong, Song } from './song';

export abstract class PlayCommand {
    protected youtubeAPIHandler: YoutubeAPIHandler;
    protected playDlHandler: PlayDlHandler;

    constructor({ youtubeAPI, playDlAPI }) {
        this.youtubeAPIHandler = youtubeAPI;
        this.playDlHandler = playDlAPI;
    }

    abstract call(
        event: Message,
        argument: string,
        usersUsingACommand?: UsersUsingACommand,
    ): Promise<Song | Song[] | Message | void>;

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
            if (this.isSongData(songData)) {
                return songData;
            }
            return;
        }

        const songId: string = rawSongId.substring(0, URLParametersPosition);

        const songData = await this.mapSongData(event, songId);
        if (this.isSongData(songData)) {
            return songData;
        }
        return;
    }

    protected isSongData(argument: Song | void): argument is Song {
        return (argument as Song).duration.string !== undefined
    }

    protected async mapSongData(event: Message, songId: string): Promise<Song | void> {
        // optenemos duracion y nombre
        // llama primero a Play-dl y si falla a Youtube API para no gastar el token
        const playDlResponse: APIResponse<YouTubeVideo> = await this.playDlHandler.getSongInfo(songId);
        if (!playDlResponse.isError) {
            const song: Song = {
                songId,
                songName: playDlResponse.data.title,
                duration: this.parseSongDuration(String(playDlResponse.data.durationInSec), true),
                thumbnails: playDlResponse.data.thumbnails[3].url
            }
            return song;
        }
        console.log(`Play-dl getSongInfo Error: ${playDlResponse.errorData}`);

        // si falla play-dl la llamamos a la api de google, para que sea mas dificil llegar al limite
        const youtubeResponse: APIResponse<RawSong> = await this.youtubeAPIHandler.searchSongById(
            songId,
        );
        if (!youtubeResponse.isError) {
            const song: Song = {
                songId,
                songName: youtubeResponse.data.songName,
                duration: this.parseSongDuration(youtubeResponse.data.duration, false),
                thumbnails: youtubeResponse.data.thumbnails
            }
            return song;

        }

        event.channel.send(`It has not been possible to get song's information`);
        console.log(`YoutubeAPI getSongInfo Error: ${youtubeResponse.errorData}`);
        return;
    }

    protected parseSongDuration(durationString = '', onlySeconds: boolean) {
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
