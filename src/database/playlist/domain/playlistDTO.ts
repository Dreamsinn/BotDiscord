import { Playlist } from './playlistEntity';

export class PlaylistDTO {
  readonly id: string;
  readonly name: string;
  readonly songsId: string[];
  readonly privatePl: boolean;
  readonly author: string;
  readonly createdBy: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly updatedBy: string | null;

  constructor(playlist: Playlist) {
    this.id = playlist.id;
    this.name = playlist.name;
    this.songsId = playlist.songsId.split(',');
    this.privatePl = playlist.privatePl;
    this.author = playlist.author;
    this.createdBy = playlist.createdBy;
    this.createdAt = playlist.createdAt;
    this.updatedAt = playlist.updatedAt;
    this.updatedBy = playlist.updatedBy;
  }
}
