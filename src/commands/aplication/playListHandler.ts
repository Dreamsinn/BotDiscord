import {
    AudioPlayerState,
    createAudioPlayer,
    createAudioResource,
    joinVoiceChannel,
} from '@discordjs/voice';
import { GuildMember, Message } from 'discord.js';
import { TogglePauseOutputEnums } from '../domain/enums/togglePauseOutputEnums';
import { IsDisplayActive } from '../domain/interfaces/isDisplayActive';
import { PlayListStatus } from '../domain/interfaces/PlayListStatus';
import { NewSongData, SongData, SongDuration } from '../domain/interfaces/songData';
import { PlayDlHandler } from '../infrastructure/playDlHandler';
import { DisplayEmbedBuilder } from './utils/displayEmbedBuilder';
import { MessageCreator } from './utils/messageCreator';
import { PaginatedMessage } from './utils/paginatedMessage';

export class PlayListHandler {
    private playList: SongData[] = [];
    private playListDuration: SongDuration = { hours: 0, minutes: 0, seconds: 0 };
    private botConnection: any;
    private player: any;
    private playDlHandler: PlayDlHandler;
    private displayEmbedBuilder: DisplayEmbedBuilder;
    private isMusicListenerActive = false;
    private loopMode = false;
    private isDisplay: IsDisplayActive = { active: false, event: undefined };

    constructor(playDlHandler: PlayDlHandler, displayEmbedBuilder: DisplayEmbedBuilder) {
        this.playDlHandler = playDlHandler;
        this.displayEmbedBuilder = displayEmbedBuilder;
    }

    public async update({ member, channel, songList, newSong }: NewSongData) {
        if (songList) {
            this.playList.push(...songList);
        } else {
            this.playList.push(newSong);
        }

        this.playListDuration = this.calculateListDuration(this.playList);

        if (songList) {
            await this.newListToPlayListEmbed(member, songList, channel);
        } else {
            this.newSongToPlayListEmbed(member, newSong, channel);
        }

        if (this.isDisplay.active) {
            this.sendPlayListDataToDisplay(false);
        }

        if (!this.botConnection || this.botConnection._state.status === 'destroyed') {
            if (!member.voice.channel) {
                channel.send('Tienes que estar en un canal de voz!');
                return;
            }
            this.joinToChannel(member, channel);
        }

        if (this.player._state.status === 'idle') {
            this.playMusic();
        }
    }

    private async newListToPlayListEmbed(
        member: GuildMember,
        songList: SongData[],
        channel: Message['channel'],
    ) {
        const songListDuration = this.calculateListDuration(songList);

        return await new PaginatedMessage({
            embed: {
                color: '#0099ff',
                title: `${songList.length} added to playlist`,
                author: {
                    name: `${member.user.username}`,
                    iconURL: `${member.user.displayAvatarURL()}`,
                },
                fields: [
                    {
                        name: 'Duracion',
                        value: this.getQeueDuration(songListDuration),
                        inline: true,
                    },
                    {
                        name: 'Posicion',
                        value: `${this.playList.length + 1 - songList.length}`,
                        inline: true,
                    },
                    {
                        name: 'Espera',
                        value: this.getQeueDuration(this.playListDuration),
                        inline: true,
                    },
                    {
                        name: 'Loop',
                        value: this.loopMode ? 'on' : 'off',
                        inline: true,
                    },
                ],
            },
            pagination: {
                channel: channel,
                rawDataToPaginate: songList,
                dataPerPage: 10,
                timeOut: 60000,
                jsFormat: true,
                reply: false,
            },
        }).call();
    }

    private newSongToPlayListEmbed(member: GuildMember, newSong: SongData, channel: Message['channel']) {
        const output = new MessageCreator({
            embed: {
                color: '#0099ff',
                title: newSong.songName
                    ? `${newSong.songName}`
                    : 'Ha habido un error a la hora de coger el nombre',
                author: {
                    name: `${member.user.username}`,
                    iconURL: `${member.user.displayAvatarURL()}`,
                },
                URL: `https://www.youtube.com/watch?v=${newSong.songId}`,
                fields: [
                    { name: 'Duracion', value: `${newSong.duration.string}`, inline: true },
                    { name: 'Posicion', value: `${this.playList.length}`, inline: true },
                    {
                        name: 'Espera',
                        value: this.getQeueDuration(this.playListDuration),
                        inline: true,
                    },
                    {
                        name: 'Loop',
                        value: this.loopMode ? 'on' : 'off',
                        inline: true,
                    },
                ],
                thumbnailUrl: newSong.thumbnails ? newSong.thumbnails : null,
            },
        }).call();

        return channel.send(output);
    }

    private calculateListDuration(songList: SongData[]) {
        const listDuration: SongDuration = { hours: 0, minutes: 0, seconds: 0 };
        if (!songList[0]) {
            return listDuration;
        }
        songList.forEach((song) => {
            listDuration.seconds += song.duration.seconds;
            listDuration.minutes += song.duration.minutes;
            listDuration.hours += song.duration.hours;

            if (listDuration.seconds >= 60) {
                listDuration.seconds -= 60;
                listDuration.minutes += 1;
            }

            if (listDuration.minutes >= 60) {
                listDuration.minutes -= 60;
                listDuration.hours += 1;
            }
        });
        return listDuration;
    }

    private getQeueDuration(listDuration: SongDuration) {
        const hours = listDuration.hours;
        const minutes = listDuration.minutes;
        const seconds = listDuration.seconds;

        if (hours !== 0) {
            return `${hours}h ${minutes}m ${seconds}s`;
        }

        if (hours == 0 && minutes !== 0) {
            return `${minutes}m${seconds}s`;
        }

        return `${seconds}s`;
    }

    private joinToChannel(member: GuildMember, channel: any) {
        this.botConnection = joinVoiceChannel({
            channelId: member.voice.channel.id,
            guildId: channel.guild.id,
            adapterCreator: channel.guild.voiceAdapterCreator,
            selfDeaf: true,
        });

        this.player = createAudioPlayer();

        this.botConnection.subscribe(this.player);

        if (this.isDisplay.active) {
            this.sendPlayListDataToDisplay(false);
        }
    }

    private async playMusic() {
        try {
            const song = await this.playDlHandler.getSongStream(this.playList[0].songId);

            const resources = createAudioResource(song.stream, {
                inputType: song.type,
            });

            this.player.play(resources);
        } catch (err) {
            console.log('Play ERROR', err);
            this.playList.shift();
            if (this.playList[0]) {
                return this.playMusic();
            }
            return;
        }

        if (!this.isMusicListenerActive) {
            this.isMusicListenerActive = true;
            this.musicEventListener();
        }

        if (this.isDisplay.active) {
            this.sendPlayListDataToDisplay(false);
        }
        return;
    }

    private musicEventListener() {
        this.player.on('stateChange', (oldState: AudioPlayerState, newState: AudioPlayerState) => {
            if (this.isDisplay.active) {
                this.sendPlayListDataToDisplay(false);
            }

            if (newState.status === 'idle') {
                if (this.loopMode) {
                    this.playList.push(this.playList[0]);
                }
                this.playList.shift();
                if (this.playList[0]) {
                    return this.playMusic();
                }
                return;
            }
        });
    }

    public readPlayListStatus() {
        const playListData: PlayListStatus = {
            playList: this.playList,
            playListDuration: this.getQeueDuration(this.calculateListDuration(this.playList)),
            loop: this.loopMode,
            playerStatus: this.player ? this.player._state.status : undefined,
            conectionStatus: this.botConnection ? this.botConnection._state.status : undefined,
        };

        return playListData;
    }

    public botDisconnect() {
        if (this.botConnection) {
            this.botConnection.destroy();
            if (this.isDisplay.active) {
                this.sendPlayListDataToDisplay(false);
            }
            return;
        }
        return;
    }

    public async skipMusic() {
        let musicToSkip: SongData;

        if (!this.player) {
            return null;
        }

        if (this.player._state.status === 'paused') {
            musicToSkip = this.playList[0];
            if (this.loopMode) {
                this.playList.push(this.playList[0]);
            }
            this.playList.shift();

            if (this.playList[0]) {
                await this.playMusic();
                this.player._state.status = 'paused';
            } else {
                this.player._state.status = 'idle';
            }

            if (this.isDisplay.active) {
                this.sendPlayListDataToDisplay(false);
            }
            return musicToSkip;
        }

        if (this.player) {
            musicToSkip = this.playList[0];
            this.player.stop();
        }
        return musicToSkip;
    }

    public togglePauseMusic(): string {
        if (!this.player) {
            return TogglePauseOutputEnums.NO_PLAYLIST;
        }
        if (this.player._state.status === 'paused') {
            this.player.unpause();
            return TogglePauseOutputEnums.PLAY;
        }

        this.player.pause();
        return TogglePauseOutputEnums.PAUSE;
    }

    public changeBotVoiceChanel(event: Message) {
        this.joinToChannel(event.member, event.channel);
        if (this.playList[0]) {
            this.playMusic();
        }
        return;
    }

    public readPlayList() {
        const playList = [...this.playList];
        return playList;
    }

    public deletePlayList() {
        if (!this.playList[0]) {
            return false;
        }

        if (this.player) {
            this.playList = [];
            this.player.stop();

            this.player._state.status = 'idle';

            if (this.isDisplay.active) {
                this.sendPlayListDataToDisplay(false);
            }
            return true;
        }
    }

    public removeSongsFromPlayList(songsIndex: number[]) {
        if (
            songsIndex.find((n) => n === 1) &&
            this.player &&
            (this.player._state.status === 'buffering' || this.player._state.status === 'playing')
        ) {
            const removedMusic = this.playList.filter((n, i) => songsIndex.includes(i + 1));

            songsIndex = songsIndex.filter((n) => n !== 1);

            this.playList = this.playList.filter((n, i) => !songsIndex.includes(i + 1));

            this.skipMusic();

            return removedMusic;
        }

        const removedMusic = this.playList.filter((n, i) => songsIndex.includes(i + 1));

        this.playList = this.playList.filter((n, i) => !songsIndex.includes(i + 1));

        if (this.isDisplay.active) {
            this.sendPlayListDataToDisplay(false);
        }
        return removedMusic;
    }

    public shufflePlayList(): boolean {
        if (!this.playList[0]) {
            return false;
        }
        const newPlayList: SongData[] = [];

        if (
            this.player &&
            (this.player._state.status === 'buffering' || this.player._state.status === 'playing')
        ) {
            newPlayList.push(this.playList[0]);
            this.playList.shift();
        }

        for (let i = this.playList.length - 1; 0 <= i; i--) {
            newPlayList.push(this.randomNextSong(i));
        }

        this.playList = newPlayList;

        if (this.isDisplay.active) {
            this.sendPlayListDataToDisplay(false);
        }

        return true;
    }

    private randomNextSong(i: number): SongData {
        const randomIndex = Math.random() * Number(i);
        const randomSong = this.playList.splice(randomIndex, 1);
        return randomSong[0];
    }

    public toggleLoopMode(): boolean {
        if (this.loopMode) {
            this.loopMode = false;
        } else {
            this.loopMode = true;
        }

        if (this.isDisplay.active) {
            this.sendPlayListDataToDisplay(false);
        }

        return this.loopMode;
    }

    public deactivateDisplay() {
        this.isDisplay.active = false;
        this.isDisplay.event = undefined;
        return;
    }

    public activateDispaly(event: Message) {
        this.isDisplay.active = true;
        this.isDisplay.event = event;

        return this.sendPlayListDataToDisplay(true);
    }

    private sendPlayListDataToDisplay(newEmbed: boolean) {
        const playListData = this.readPlayListStatus();

        return this.displayEmbedBuilder.call(playListData, this.isDisplay.event, newEmbed);
    }

    public logPlaylistStatus() {
        console.log('PLAYER: ', this.player ? this.player : null);
        console.log('BOTCONNECTION: ', this.botConnection ? this.botConnection : null);
        console.log('PLAYLIST: ', this.playList);
        return;
    }
}
