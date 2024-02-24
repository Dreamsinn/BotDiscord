import { GuildMember, Message } from 'discord.js';

export interface SongData {
  songName: string;
  songId: string;
  duration: SongDuration;
  thumbnails: string;
}

export interface SongsToPlaylist {
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

export interface RawSong {
  songId: string;
  songName?: string;
  duration?: string;
  thumbnails?: string;
}

export interface SpotifyRawSong {
  spotifySongId: string;
  songName: string;
  songAuthor: string;
  duration: string;
  thumbnails: string;
}
