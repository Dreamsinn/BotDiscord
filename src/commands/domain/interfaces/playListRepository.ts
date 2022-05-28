export interface playListRepository {
    songName: string,
    songId: string,
    duration: durationRepository,
}

export interface newSongRepository {
    songName: string,
    songId: string,
    duration: durationRepository,
    channel: any,
    user: any
}

export interface durationRepository {
    hours: number,
    minutes: number,
    seconds: number,
    string?: string
}