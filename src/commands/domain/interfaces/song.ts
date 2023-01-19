import { GuildMember, Message } from 'discord.js';

export interface Song {
    songName: string;
    songId: string;
    duration: SongDuration;
    thumbnails: string;
}

export interface NewSong {
    newSongs: Song | Song[];
    channel: Message['channel'];
    member: GuildMember;
}

export interface SongDuration {
    hours: number;
    minutes: number;
    seconds: number;
    string: string;
}

export interface RawSong {
    songId: string;
    songName?: string;
    duration?: string;
    thumbnails?: string;
}
