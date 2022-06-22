import { GuildMember, Message } from 'discord.js';

export interface SongData {
    songName: string;
    songId: string;
    duration: SongDuration;
    thumbnails: string;
}

export interface NewSongData {
    newSong?: SongData;
    songList?: SongData[];
    channel: Message['channel'];
    member: GuildMember;
}

export interface SongDuration {
    hours: number;
    minutes: number;
    seconds: number;
    string?: string;
}

export interface RawSongData {
    id?: string;
    title?: string;
    duration?: number;
    durationString?: string;
    durationData?: SongDuration;
    thumbnails?: string;
}
