import { durationRepository } from "./playListRepository";

export interface SearchedSongRepository {
    id?: string;
    title?: string;
    duration?: number;
    durationString?: string;
    durationData?: durationRepository;
}