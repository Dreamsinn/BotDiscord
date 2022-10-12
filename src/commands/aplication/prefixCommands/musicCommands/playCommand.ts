import { Message } from 'discord.js';
import { YouTubeVideo } from 'play-dl';
import { PlayCommandSchema } from '../../../domain/commandSchema/playCommandSchema';
import { discordEmojis } from '../../../domain/discordEmojis';
import { APIResponse } from '../../../domain/interfaces/APIResponse';
import { Command } from '../../../domain/interfaces/Command';
import { CommandSchema } from '../../../domain/interfaces/commandSchema';
import { NewSongData, RawSongData, SongData } from '../../../domain/interfaces/songData';
import { PlayDlHandler } from '../../../infrastructure/playDlHandler';
import { YoutubeAPIHandler } from '../../../infrastructure/youtubeHandler';
import { PlayListHandler } from '../../playListHandler';
import { CheckAdminRole } from '../../utils/CheckAdminRole';
import { CoolDown } from '../../utils/coolDown';
import { MessageCreator } from '../../utils/messageCreator';
import { UsersUsingACommand } from '../../utils/usersUsingACommand';

export class PlayCommand extends Command {
    private playSchema: CommandSchema = PlayCommandSchema;
    private coolDown = new CoolDown();
    private checkAdminRole = new CheckAdminRole();
    private usersUsingACommand: UsersUsingACommand;
    private youtubeAPIHandler: YoutubeAPIHandler;
    private playListHandler: PlayListHandler;
    private playDlHandler: PlayDlHandler;

    constructor(
        youtubeAPIHandler: YoutubeAPIHandler,
        playListHandler: PlayListHandler,
        playDlHandler: PlayDlHandler,
    ) {
        super();
        this.youtubeAPIHandler = youtubeAPIHandler;
        this.playListHandler = playListHandler;
        this.playDlHandler = playDlHandler;
    }

    public call(event: Message, usersUsingACommand: UsersUsingACommand) {
        if (this.playSchema.adminOnly) {
            const interrupt = this.checkAdminRole.call(event);
            if (!interrupt) {
                return;
            }
        }

        this.usersUsingACommand = usersUsingACommand;

        const emptySpacePosition = event.content.search(' ');
        if (emptySpacePosition === -1) {
            return;
        }

        if (!event.member.voice.channel) {
            event.channel.send('Tienes que estar en un canal de voz!');
            return;
        }

        const interrupt = this.coolDown.call(this.playSchema.coolDown);
        if (interrupt === 1) {
            console.log('command interrupted by cooldown');
            return;
        }

        const argument = event.content.substring(emptySpacePosition);

        if (argument.includes('https://youtu.be/')) {
            return this.findSongIdFromMobileURL(argument, event);
        }

        if (argument.includes('youtube.com/playlist?list=')) {
            return this.findYoutubePlayList(argument, event);
        }

        if (argument.includes('youtube.com') && argument.includes('&list=')) {
            return this.findYoutubePlayList(argument, event, true);
        }

        if (argument.includes('youtube.com/watch?v=')) {
            return this.findSongIdFromYoutubeURL(argument, event);
        }

        return this.searchBySongName(argument, event);
    }

    private async searchBySongName(argument: string, event: Message) {
        let musicData: RawSongData[];

        const playDlResponse: APIResponse<RawSongData[]> = await this.playDlHandler.searchSongByName(
            argument,
        );

        if (playDlResponse.isError) {
            console.log(`Play-dl Search by name Error: ${playDlResponse.errorData}`);

            const youtubeResponse = await this.youtubeAPIHandler.searchSongByName(argument);

            if (youtubeResponse.isError) {
                console.log('Youtube Search by name Error:', youtubeResponse.errorData);
                event.channel.send(`It has not been possible to get song's data`);
                return;
            }

            musicData = youtubeResponse.data;
        } else {
            musicData = playDlResponse.data;
        }

        if (!musicData[0]) {
            event.channel.send('No hay coincidencias');
            return;
        }

        const { output, numberChoices } = this.createSelectChoicesEmbed(musicData);

        this.usersUsingACommand.updateUserList(event.author.id);

        const message = await event.reply(output);

        const filter = (reaction: Message) => {
            const authorCondition = event.author.id === reaction.author.id;
            const letterCondition = reaction.content === 'x';
            const numberCondition =
                Number(reaction.content) &&
                Number(reaction.content) > 0 &&
                Number(reaction.content) < numberChoices;

            return authorCondition && (letterCondition || numberCondition);
        };

        message.channel
            .awaitMessages({ filter, time: 20000, max: 1, errors: ['time'] })
            .then((collected) => {
                this.usersUsingACommand.removeUserList(event.author.id);
                let collectedMessage: Message;
                collected.map((e: Message) => (collectedMessage = e));

                if (collectedMessage.content === 'x') {
                    console.log('Search cancelled');
                    event.reply('Search cancelled');
                    message.delete();
                    collectedMessage.delete();
                    return;
                }

                const numberSelected = Number(collectedMessage.content) - 1;

                const song: RawSongData = musicData[numberSelected];

                message.delete();

                collectedMessage.delete();

                return this.updateToPlayList(event, song);
            })
            .catch((err) => {
                if (err instanceof TypeError) {
                    console.log('Select music colector error: ', err);
                    event.channel.send(`Error: ${err.message}`);
                } else {
                    console.log(`No answer`);
                    event.reply('Time out');
                }

                this.usersUsingACommand.removeUserList(event.author.id);
                message.delete();
                return;
            });
    }

    private createSelectChoicesEmbed(songList: RawSongData[]) {
        let embedContent = '```js\n';

        songList.forEach((song, i) => {
            embedContent += `${i + 1} - ${song.title}\n`;
        });

        embedContent += `${discordEmojis.x} - Cancel\n` + '```';

        const output = new MessageCreator({
            embed: {
                color: '#40b3ff',
                field: {
                    name: 'Escriba el número de la canción que quiera seleccionar',
                    value: embedContent,
                    inline: false,
                },
            },
        }).call();

        return { output, numberChoices: songList.length };
    }

    private findSongIdFromYoutubeURL(url: string, event: Message) {
        const rawSongId = url
            .replace('https://', '')
            .replace('www.', '')
            .replace('youtube.com/watch?v=', '')
            .replace(/^./, '');

        const URLParametersPosition = rawSongId.indexOf('&');

        if (URLParametersPosition === -1) {
            const song: RawSongData = { id: rawSongId };
            return this.updateToPlayList(event, song);
        }

        const song: RawSongData = { id: rawSongId.substring(0, URLParametersPosition) };

        return this.updateToPlayList(event, song);
    }

    private findSongIdFromMobileURL(url: string, event: Message) {
        const songId = url.replace('https://youtu.be/', '').replace(/^./, '');

        const song: RawSongData = { id: songId };

        return this.updateToPlayList(event, song);
    }

    private async updateToPlayList(event: Message, song: RawSongData) {
        const songData: RawSongData = await this.mapSongData(event, song);
        if (songData.title && songData.durationData) {
            const newSong: NewSongData = {
                newSong: {
                    songName: songData.title,
                    songId: songData.id,
                    duration: songData.durationData,
                    thumbnails: songData.thumbnails,
                },
                channel: event.channel,
                member: event.member,
            };

            return this.playListHandler.update(newSong);
        }
        return;
    }

    private async mapSongData(event: Message, song: RawSongData): Promise<RawSongData> {
        const playDlResponse: APIResponse<YouTubeVideo> = await this.playDlHandler.getSongInfo(song.id);
        if (!playDlResponse.isError) {
            if (!song.title) {
                song.title = playDlResponse.data.title;
            }
            song.durationData = this.parseSongDuration(String(playDlResponse.data.durationInSec), true);
            song.thumbnails = playDlResponse.data.thumbnails[3].url;
            return song;
        }
        console.log(`Play-dl getSongInfo Error: ${playDlResponse.errorData}`);

        const youtubeResponse: APIResponse<RawSongData> = await this.youtubeAPIHandler.searchSongById(
            song.id,
        );
        if (!youtubeResponse.isError) {
            if (!song.title) {
                song.title = youtubeResponse.data.title;
            }
            song.durationData = this.parseSongDuration(youtubeResponse.data.durationString, false);
            song.thumbnails = youtubeResponse.data.thumbnails;
            return song;
        }

        event.channel.send(`It has not been possible to get song's information`);
        console.log(`YoutubeAPI getSongInfo Error: ${youtubeResponse.errorData}`);
        return song;
    }

    private async findYoutubePlayList(url: string, event: Message, watch = false) {
        let playListId: string;

        if (!watch) {
            playListId = url
                .replace('https://', '')
                .replace('www.', '')
                .replace('youtube.com/playlist?list=', '')
                .replace(/^./, '');

            if (playListId.length < 3) {
                return event.reply('Palylist bad request');
            }

            const playDlResponse: APIResponse<RawSongData[]> =
                await this.playDlHandler.getSognsInfoFromPlayList(url);

            if (!playDlResponse.isError) {
                return this.mapPlayDLPlayListData(event, playDlResponse.data);
            }

            event.channel.send('Play-dl failed to fectch PlayList, it will be tried with Youtube API');
            console.log('PlayDl getSognsInfoFromPlayList Error:', playDlResponse.errorData);
            return this.fetchYoutubePlayListData(event, playListId, url);
        }

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
            return this.findSongIdFromYoutubeURL(url, event);
        }

        return this.isPlayListDesired(event, playListId, url);
    }

    private async isPlayListDesired(event: Message, playListId: string, url: string) {
        const output = new MessageCreator({
            embed: {
                color: '#40b3ff',
                title: 'Is playlist desired?',
                description: 'Y - Play playlisy \nN - Play song \nX - Cancel',
            },
        }).call();

        const message = await event.channel.send(output);

        this.usersUsingACommand.updateUserList(event.author.id);

        const filter = (reaction: Message) => {
            const authorCondition = event.author.id === reaction.author.id;
            const contentCondition = ['y', 'Y', 'n', 'N', 'x', 'X'].includes(reaction.content);
            return authorCondition && contentCondition;
        };

        message.channel
            .awaitMessages({ filter, time: 20000, max: 1, errors: ['time'] })
            .then(async (collected) => {
                this.usersUsingACommand.removeUserList(event.author.id);
                let collectedMessage: Message;
                collected.map((e: Message) => (collectedMessage = e));

                if (['x', 'X'].includes(collectedMessage.content)) {
                    console.log('Search cancelled');
                    event.reply('Search cancelled');

                    message.delete();
                    return;
                }

                if (['n', 'N'].includes(collectedMessage.content)) {
                    message.delete();
                    return this.findSongIdFromYoutubeURL(url, event);
                }

                if (['y', 'Y'].includes(collectedMessage.content)) {
                    message.delete();
                    const playDlResponse: APIResponse<RawSongData[]> =
                        await this.playDlHandler.getSognsInfoFromPlayList(url);
                    if (!playDlResponse.isError) {
                        return this.mapPlayDLPlayListData(event, playDlResponse.data);
                    }

                    console.log('playDl getSognsInfoFromPlayList Error: ', playDlResponse.errorData);
                    event.channel.send(
                        'Play-dl failed to fectch PlayList, it will be tried with Youtube API',
                    );
                    return this.fetchYoutubePlayListData(event, playListId, url);
                }
            })
            .catch((err) => {
                if (err instanceof TypeError) {
                    console.log(err);
                    event.channel.send(`Error: ${err.message}`);
                } else {
                    console.log(`No answer`);
                    event.reply('Time out');
                }
                this.usersUsingACommand.removeUserList(event.author.id);
                message.delete();
                return;
            });
    }

    private mapPlayDLPlayListData(event: Message, rawPlayList: RawSongData[]) {
        const playList: SongData[] = [];
        rawPlayList.forEach((song: RawSongData) => {
            const newSong: SongData = {
                songName: song.title,
                songId: song.id,
                duration: this.parseSongDuration(String(song.duration), true),
                thumbnails: song.thumbnails,
            };
            playList.push(newSong);
        });
        return this.updatePlayListWithAPlayList(event, playList);
    }

    private async fetchYoutubePlayListData(event: Message, playListId: string, url: string) {
        const youtubeResponse: APIResponse<RawSongData[]> = await this.youtubeAPIHandler.searchPlaylist(
            playListId,
        );

        if (youtubeResponse.isError) {
            console.log(`YoutubeAPI searchPlaylist Error: ${youtubeResponse.errorData}`);
            event.channel.send(`It has not been possible to get playList`);
            if (url.includes('watch?v=')) {
                event.channel.send(`Instead, song will be played`);
                return this.findSongIdFromYoutubeURL(url, event);
            }
            return;
        }

        const playlist: SongData[] = await this.mapSongListData(event, youtubeResponse.data);

        return this.updatePlayListWithAPlayList(event, playlist);
    }

    private async mapSongListData(event: Message, rawPlayList: RawSongData[]): Promise<SongData[]> {
        const playlist: SongData[] = [];
        for (let i = 0; rawPlayList.length > i; i++) {
            const songData = await this.mapSongData(event, rawPlayList[i]);
            if (songData.title && songData.thumbnails) {
                const newSong: SongData = {
                    songName: songData.title,
                    songId: songData.id,
                    duration: songData.durationData,
                    thumbnails: songData.thumbnails,
                };
                playlist.push(newSong);
            }
        }
        return playlist;
    }

    private async updatePlayListWithAPlayList(event, playList?: SongData[]) {
        const newSongList: NewSongData = {
            songList: playList,
            channel: event.channel,
            member: event.member,
        };

        return this.playListHandler.update(newSongList);
    }

    private parseSongDuration(durationString = '', onlySeconds: boolean) {
        if (onlySeconds) {
            const duration = Number(durationString);
            const hours = Math.floor(duration / 3600);
            const minutes = Math.floor((duration % 3600) / 60);
            const seconds = Math.floor((duration % 3600) % 60);

            durationString = `${hours}H${minutes}M${seconds}S`;

            if (hours === 0) {
                durationString = `${minutes}M${seconds}S`;
            }

            if (minutes === 0 && hours === 0) {
                durationString = `${seconds}S`;
            }
        }
        const duration = { hours: 0, minutes: 0, seconds: 0, string: '' };
        const durationParts = durationString
            .replace('PT', '')
            .replace('H', ':')
            .replace('M', ':')
            .replace('S', '')
            .split(':');

        if (durationParts.length === 3) {
            duration.hours = Number(durationParts[0]);
            duration.minutes = Number(durationParts[1]);
            duration.seconds = Number(durationParts[2]);
            duration.string = `${duration.hours}h${duration.minutes}m${duration.seconds}s`;
        }

        if (durationParts.length === 2) {
            duration.minutes = Number(durationParts[0]);
            duration.seconds = Number(durationParts[1]);
            duration.string = `${duration.minutes}m${duration.seconds}s`;
        }

        if (durationParts.length === 1) {
            duration.seconds = Number(durationParts[0]);
            duration.string = `${duration.seconds}s`;
        }

        return duration;
    }
}
