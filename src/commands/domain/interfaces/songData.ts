import { GuildMember, Message } from 'discord.js';

export interface songData {
    songName: string;
    songId: string;
    duration: songDuration;
    thumbnails: string;
}

export interface newSongData {
    newSong?: songData;
    songList?: songData[];
    channel: Message['channel'];
    member: GuildMember;
}

export interface songDuration {
    hours: number;
    minutes: number;
    seconds: number;
    string?: string;
}

export interface rawSongData {
    id?: string;
    title?: string;
    duration?: number;
    durationString?: string;
    durationData?: songDuration;
    thumbnails?: string;
}
