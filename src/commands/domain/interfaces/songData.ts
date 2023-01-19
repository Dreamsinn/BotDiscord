import { GuildMember, Message } from 'discord.js';

export interface SongData {
    songName: string;
    songId: string;
    duration: SongDuration;
    thumbnails: string;
}

export interface NewSongData {
    newSongs: SongData | SongData[];
    channel: Message['channel'];
    member: GuildMember;
}

export interface SongDuration {
    hours: number;
    minutes: number;
    seconds: number;
    string: string;
}

export interface RawSongData {
    songId: string;
    songName?: string;
    duration?: string;
    thumbnails?: string;
}
