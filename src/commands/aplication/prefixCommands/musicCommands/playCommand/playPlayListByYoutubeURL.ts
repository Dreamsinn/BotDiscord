import { Message } from 'discord.js';
import { APIResponse } from '../../../../domain/interfaces/APIResponse';
import { PlayCommand } from '../../../../domain/interfaces/playCommand';
import { RawSong, Song } from '../../../../domain/interfaces/song';
import { PlayDlService } from '../../../../infrastructure/playDlService';
import { YouTubeAPIService } from '../../../../infrastructure/youTubeAPIService';
import { MessageCreator } from '../../../utils/messageCreator';
import { UsersUsingACommand } from '../../../utils/usersUsingACommand';

export class PlayPlayListByYoutubeURL extends PlayCommand {
    private usersUsingACommand: UsersUsingACommand;

    constructor(
        musicAPIs: {
            youtubeAPI: YouTubeAPIService;
            playDlAPI: PlayDlService;
        },
        usersUsingACommand: UsersUsingACommand,
    ) {
        super(musicAPIs);
        this.usersUsingACommand = usersUsingACommand;
    }

    async call(event: Message, url: string): Promise<Song | Song[] | Message<boolean> | void> {
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

    private async notStartedPlayListUrl(event: Message, url: string) {
        const playListId = url
            .replace('https://', '')
            .replace('www.', '')
            .replace('youtube.com/playlist?list=', '')
            .replace(/^./, '');

        if (playListId.length < 3) {
            return event.reply('Palylist bad request');
        }

        // llamamos primero a Play-dl porue ya da la informacion del video y no hara falta hacer una busqueda por cada video de la playlist
        const playDlResponse: APIResponse<RawSong[]> = await this.playDlHandler.getSognsInfoFromPlayList(
            url,
        );

        if (!playDlResponse.isError) {
            return this.mapPlayDLPlayListData(event, playDlResponse.data);
        }

        // si Play-dl falla
        console.log(`PlayDl getSognsInfoFromPlayList Error: ${playDlResponse.errorData}`);
        return this.fetchYoutubePlayListData(event, playListId, url);
    }

    private async isPlayListDesired(event: Message, playListId: string, url: string) {
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
            let collectedMessage: Message;
            collected.map((e: Message) => (collectedMessage = e));

            // Si se responde una X se borra el mensaje
            if (['x', 'X'].includes(collectedMessage.content)) {
                event.reply('Search cancelled');

                message.delete();
                return;
            }

            // N que toque la cancion del enlace
            if (['n', 'N'].includes(collectedMessage.content)) {
                message.delete();
                return this.findSongIdFromYoutubeURL(event, url);
            }

            // play playList
            if (['y', 'Y'].includes(collectedMessage.content)) {
                message.delete();
                const playDlResponse: APIResponse<RawSong[]> =
                    await this.playDlHandler.getSognsInfoFromPlayList(url);
                if (!playDlResponse.isError) {
                    return this.mapPlayDLPlayListData(event, playDlResponse.data);
                }

                console.log(`playDl getSognsInfoFromPlayList Error: ${playDlResponse.errorData}`);
                return this.fetchYoutubePlayListData(event, playListId, url);
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

    private mapPlayDLPlayListData(event: Message, rawPlayList: RawSong[]) {
        const playList: Song[] = rawPlayList.map((song: RawSong) => {
            const newSong: Song = {
                songName: song.songName,
                songId: song.songId,
                duration: this.parseSongDuration(String(song.duration), true),
                thumbnails: song.thumbnails,
            };
            return newSong;
        });
        return playList;
    }

    private async fetchYoutubePlayListData(
        event: Message,
        playListId: string,
        url: string,
    ): Promise<Song | Song[] | void> {
        // llama a la API de youtube, si esta tambien falla y esta sonando un video reproduce el video
        const youtubeResponse: APIResponse<RawSong[]> = await this.youtubeAPIHandler.searchPlaylist(
            playListId,
        );
        if (youtubeResponse.isError) {
            console.log(`YoutubeAPI searchPlaylist Error: ${youtubeResponse.errorData}`);
            event.channel.send(`It has not been possible to get playList`);
            if (url.includes('watch?v=')) {
                event.channel.send(`Instead, song will be played`);
                return this.findSongIdFromYoutubeURL(event, url);
            }
            return;
        }

        // por cada video llama a la api para obtener la informacion
        return this.mapSongListData(event, youtubeResponse.data);
    }

    private async mapSongListData(event: Message, rawPlayList: RawSong[]): Promise<Song[]> {
        const playList: Song[] = [];
        for (const rawSong of rawPlayList) {
            const songData = await this.mapSongData(event, rawSong.songId, true);
            if (this.isSongData(songData)) {
                playList.push(songData);
            }
        }
        return playList;
    }
}
