import { Song } from './songData';

export interface PlayListStatus {
    playList: Song[];
    playListDuration: string;
    loop: boolean;
    playerStatus: string;
    conectionStatus: string;
}
