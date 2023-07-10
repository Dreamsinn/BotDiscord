import { SongData } from './song';

export interface PlayListStatus {
    playList: SongData[];
    playListDuration: string;
    loop: boolean;
    playerStatus: string;
    conectionStatus: string;
}
