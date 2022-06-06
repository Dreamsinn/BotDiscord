export interface playListRepository {
    songName: string,
    songId: string,
    duration: durationRepository,
}

export interface newSongRepository {
    newSong?: playListRepository,
    songList?: playListRepository[],
    channel: any,
    member: any
}

export interface durationRepository {
    hours: number,
    minutes: number,
    seconds: number,
    string?: string
}