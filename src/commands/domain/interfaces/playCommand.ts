import { Message } from "discord.js";
import { YouTubeVideo } from "play-dl";
import { UsersUsingACommand } from "../../aplication/utils/usersUsingACommand";
import { PlayDlHandler } from "../../infrastructure/playDlHandler";
import { YoutubeAPIHandler } from "../../infrastructure/youtubeHandler";
import { APIResponse } from "./APIResponse";
import { RawSongData } from "./songData";

export abstract class PlayCommand {
    protected youtubeAPIHandler: YoutubeAPIHandler;
    protected playDlHandler: PlayDlHandler;

    constructor({ youtubeAPI, playDlAPI }) {
        this.youtubeAPIHandler = youtubeAPI;
        this.playDlHandler = playDlAPI;
        this
    }

    abstract call(event: Message, argument: string, usersUsingACommand?: UsersUsingACommand): Promise<RawSongData | undefined>;

    protected async mapSongData(event: Message, song: RawSongData): Promise<RawSongData> {
        // optenemos duracion y nombre
        // llama primero a Play-dl y si falla a Youtube API para no gastar el token
        const playDlResponse: APIResponse<YouTubeVideo> = await this.playDlHandler.getSongInfo(song.id);
        if (!playDlResponse.isError) {
            if (!song.title) {
                song.title = playDlResponse.data.title;
            }
            song.durationData = this.parseSongDuration(String(playDlResponse.data.durationInSec), true);
            song.thumbnails = playDlResponse.data.thumbnails[3].url;
            return song;
        }
        console.log(`Play-dl getSongInfo Error: ${playDlResponse.errorData}`);

        // si falla play-dl la llamamos a la api de google, para que sea mas dificil llegar al limite
        const youtubeResponse: APIResponse<RawSongData> = await this.youtubeAPIHandler.searchSongById(
            song.id,
        );
        if (!youtubeResponse.isError) {
            if (!song.title) {
                song.title = youtubeResponse.data.title;
            }
            song.durationData = this.parseSongDuration(youtubeResponse.data.durationString, false);
            song.thumbnails = youtubeResponse.data.thumbnails;
            return song;
        }

        event.channel.send(`It has not been possible to get song's information`);
        console.log(`YoutubeAPI getSongInfo Error: ${youtubeResponse.errorData}`);
        return song;
    }

    private parseSongDuration(durationString = '', onlySeconds: boolean) {
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