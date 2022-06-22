import { SongData } from './songData';

export interface PlayListStatus {
    playList: SongData[];
    playListDuration: string;
    loop: boolean;
    playerStatus: string;
    conectionStatus: string;
}
