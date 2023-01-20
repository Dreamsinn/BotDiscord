import { Song } from './song';

export interface PlayListStatus {
    playList: Song[];
    playListDuration: string;
    loop: boolean;
    playerStatus: string;
    conectionStatus: string;
}
