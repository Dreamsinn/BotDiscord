import { songData } from './songData';

export interface PlayListStatus {
    playList: songData[];
    playListDuration: string;
    loop: boolean;
    playerStatus: string;
    conectionStatus: string;
}
