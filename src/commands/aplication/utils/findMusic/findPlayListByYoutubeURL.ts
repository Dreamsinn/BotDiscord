import { Message } from 'discord.js';
import { APIResponse } from '../../../domain/interfaces/APIResponse';
import { MusicAPIs } from '../../../domain/interfaces/musicAPIs';
import { SearchSong } from '../../../domain/interfaces/searchSong';
import { RawSong, SongData } from '../../../domain/interfaces/song';
import { MessageCreator } from '../messageCreator';
import { UsersUsingACommand } from '../usersUsingACommand';

export class FindPlayListByYoutubeURL extends SearchSong {
    private usersUsingACommand: UsersUsingACommand;

    constructor(musicAPIs: MusicAPIs) {
        super(musicAPIs);
    }

    async call(
        event: Message,
        argument: string,
        usersUsingACommand: UsersUsingACommand,
    ): Promise<SongData | SongData[] | void> {
        const url = argument;

        this.usersUsingACommand = usersUsingACommand;

        if (!url.includes('&list=')) {
            // sino se esta rerpoduciendo un video
            return this.notStartedPlayListUrl(event, url);
        }

        // si esta reproduciendo un video
        let playListId: string;

        const playListIdPosition = url.search('&list=');
        const rawPlayListId = url.substring(playListIdPosition + 6);

        if (rawPlayListId.includes('&')) {
            const nextParameterPosition = rawPlayListId.search('&');
            playListId = rawPlayListId.substring(0, nextParameterPosition);
        } else {
            playListId = rawPlayListId;
        }

        if (playListId.length < 3) {
            event.reply('Palylist bad request, instead song will be played');
            return this.findSongIdFromYoutubeURL(event, url);
        }

        return await this.isPlayListDesired(event, playListId, url);
    }

    private async notStartedPlayListUrl(
        event: Message,
        url: string,
    ): Promise<SongData[] | SongData | void> {
        const playListId = url
            .replace('https://', '')
            .replace('www.', '')
            .replace('youtube.com/playlist?list=', '')
            .replace(/^./, '');

        if (playListId.length < 3) {
            event.reply('Palylist bad request');
            return;
        }

        // llamamos primero a Play-dl porue ya da la informacion del video y no hara falta hacer una busqueda por cada video de la playlist
        const playDlResponse: APIResponse<RawSong[]> = await this.playDlService.getSognsInfoFromPlayList(
            url,
        );

        if (!playDlResponse.isError) {
            return this.mapPlayDLPlayListData(playDlResponse.data);
        }

        // si Play-dl falla
        console.log(`PlayDl getSognsInfoFromPlayList Error: ${playDlResponse.errorData}`);
        return this.fetchYoutubePlayListData(event, playListId, url);
    }

    private async isPlayListDesired(
        event: Message,
        playListId: string,
        url: string,
    ): Promise<SongData[] | SongData | void> {
        // preguntamos al usuario si quiere reproducir la cancion el la playlist
        const output = new MessageCreator({
            embed: {
                color: '#40b3ff',
                title: 'Is playlist desired?',
                description: 'Write: \n**Y** - Play playlisy \n**N** - Play song \n**X** - Cancel',
            },
        }).call();

        const message = await event.channel.send(output);

        this.usersUsingACommand.updateUserList(event.author.id);

        const filter = (reaction: Message) => {
            const authorCondition = event.author.id === reaction.author.id;
            const contentCondition = ['y', 'Y', 'n', 'N', 'x', 'X'].includes(reaction.content);
            // si el autor es el mismo, y el mensaje contiene Y, N, o X
            return authorCondition && contentCondition;
        };

        try {
            const collected = await message.channel.awaitMessages({
                filter,
                time: 20000,
                max: 1,
                errors: ['time'],
            });
            this.usersUsingACommand.removeUserList(event.author.id);
            const collectedMessage: Message<boolean>[] = collected.map((e: Message) => e);

            // Si se responde una X se borra el mensaje
            if (['x', 'X'].includes(collectedMessage[0].content)) {
                event.reply('Search cancelled');
                message.delete();
                return;
            }

            // N que toque la cancion del enlace
            if (['n', 'N'].includes(collectedMessage[0].content)) {
                message.delete();
                return this.findSongIdFromYoutubeURL(event, url);
            }

            // play playList
            if (['y', 'Y'].includes(collectedMessage[0].content)) {
                message.delete();
                const playDlResponse: APIResponse<RawSong[]> =
                    await this.playDlService.getSognsInfoFromPlayList(url);

                if (!playDlResponse.isError) {
                    return this.mapPlayDLPlayListData(playDlResponse.data);
                }

                console.log(`playDl getSognsInfoFromPlayList Error: ${playDlResponse.errorData}`);

                return await this.fetchYoutubePlayListData(event, playListId, url);
            }
        } catch (err) {
            if (err instanceof TypeError) {
                console.log('Is Playlist Desired colector error: ', err);
                event.channel.send(`Ha habido un error, por favor vuelvelo a intentar`);
            } else {
                // sino contesta
                event.reply('Time out');
            }
            this.usersUsingACommand.removeUserList(event.author.id);
            message.delete();
            return;
        }
    }

    private mapPlayDLPlayListData(rawPlayList: RawSong[]): SongData[] {
        const playList: SongData[] = rawPlayList.map((song: RawSong) => {
            const newSong: SongData = {
                songName: song.songName ?? "It has not been possible to get song's title",
                songId: song.songId,
                duration: this.parseSongDuration(String(song.duration), true),
                thumbnails: song.thumbnails ?? '',
            };
            return newSong;
        });
        return playList;
    }

    private async fetchYoutubePlayListData(
        event: Message,
        playListId: string,
        url: string,
    ): Promise<SongData | SongData[] | void> {
        // llama a la API de youtube
        const youtubeResponse: APIResponse<string> = await this.youtubeAPIService.searchPlaylist(
            playListId,
        );

        if (youtubeResponse.isError) {
            // si esta tambien falla y esta sonando un video reproduce el video
            console.log(`YoutubeAPI searchPlaylist Error: ${youtubeResponse.errorData}`);
            event.channel.send(`It has not been possible to get playList`);

            if (url.includes('watch?v=')) {
                event.channel.send(`Instead, song will be played`);
                return this.findSongIdFromYoutubeURL(event, url);
            }
            return;
        }

        return this.mapPlayListData(event, youtubeResponse.data);
    }

    protected async mapPlayListData(event: Message, songIdList: string): Promise<SongData[] | void> {
        // youtube api tiene la capacided de buscar multiples ids a la vez
        const youtubeResponse: APIResponse<RawSong[]> = await this.youtubeAPIService.searchSongById(
            songIdList,
        );

        if (!youtubeResponse.isError) {
            const playListData: SongData[] = youtubeResponse.data.map((rawSong: RawSong) => {
                const song: SongData = {
                    songId: rawSong.songId,
                    songName: rawSong.songName ?? "It has not been possible to get song's title",
                    duration: this.parseSongDuration(rawSong.duration, false),
                    thumbnails: rawSong.thumbnails ?? '',
                };
                return song;
            });
            return playListData;
        }
        console.log(`YoutubeAPI getPlayListgInfo Error: ${youtubeResponse.errorData}`);

        // si falla vamos una por una con playDL
        const songIdArray: string[] = songIdList.split(',');
        const playListData: SongData[] = [];

        for (const songId of songIdArray) {
            const playDlResponse: APIResponse<RawSong> = await this.playDlService.getSongInfo(songId);
            if (!playDlResponse.isError) {
                const song: SongData = {
                    songId: playDlResponse.data.songId,
                    songName:
                        playDlResponse.data.songName ?? "It has not been possible to get song's title",
                    duration: this.parseSongDuration(playDlResponse.data.duration, true),
                    thumbnails: playDlResponse.data.thumbnails ?? '',
                };
                playListData.push(song);
            }
        }

        if (playListData.length) {
            return playListData;
        }

        console.log(`Play-dl getPlayListgInfo Error`);
        event.channel.send(`It has not been possible to get playList information`);
        return;
    }
}
