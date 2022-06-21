import {
    AudioPlayerState,
    createAudioPlayer,
    createAudioResource,
    joinVoiceChannel,
} from '@discordjs/voice';
import { GuildMember, Message } from 'discord.js';
import { IsDisplayActive } from '../domain/interfaces/isDisplayActive';
import { PlayListStatus } from '../domain/interfaces/PlayListStatus';
import { newSongData, songData, songDuration } from '../domain/interfaces/songData';
import { PlayDlHandler } from '../infrastructure/playDlHandler';
import { DisplayEmbedBuilder } from './utils/displayEmbedBuilder';
import { MessageCreator } from './utils/messageCreator';
import { PaginatedMessage } from './utils/paginatedMessage';

export class PlayListHandler {
    private playList: songData[] = [];
    private playListDuration: songDuration = { hours: 0, minutes: 0, seconds: 0 };
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

    public async update({ member, channel, songList, newSong }: newSongData) {
        // si no estas en un canal de voz
        if (songList) {
            this.playList.push(...songList);
        } else {
            this.playList.push(newSong);
        }

        if (songList) {
            await this.newListToPlayListEmbed(member, songList, channel);
        } else {
            this.newSongToPlayListEmbed(member, newSong, channel);
        }

        // si display está activo le pasa información al constructor del embed
        if (this.isDisplay.active) {
            this.sendPlayListDataToDisplay(false);
        }

        // calcula el tiempo total de la cola, lo hace despues del embed porque el tiempo del acancion no entra en el tiempo de espera
        this.playListDuration = this.calculateListDuration(this.playList);

        // si no hay conexion o se ha desconectado el bot dle canal de voz, que entablezca una nueva conexion
        if (!this.botConnection || this.botConnection._state.status === 'destroyed') {
            if (!member.voice.channel) {
                channel.send('Tienes que estar en un canal de voz!');
                return;
            }
            this.joinToChannel(member, channel);
        }

        // si el player no esta reproduciendo
        if (this.player._state.status === 'idle') {
            this.playMusic();
        }
    }

    private async newListToPlayListEmbed(
        member: GuildMember,
        songList: songData[],
        channel: Message['channel'],
    ) {
        // TODO: descripcion con lista de todas las canciones, mas adelante, con paginacion de 20s y sin mensaje de Time Out
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
                        value: `${this.getQeueDuration(songListDuration)}`,
                        inline: true,
                    },
                    {
                        name: 'Posicion',
                        value: `${this.playList.length + 1 - songList.length}`,
                        inline: true,
                    },
                    {
                        name: 'Espera',
                        value: `${this.getQeueDuration(this.playListDuration)}`,
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

    private newSongToPlayListEmbed(member: GuildMember, newSong: songData, channel: Message['channel']) {
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
                        value: `${this.getQeueDuration(this.playListDuration)}`,
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

    private calculateListDuration(songList: songData[]) {
        const listDuration: songDuration = { hours: 0, minutes: 0, seconds: 0 };
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

    private getQeueDuration(listDuration: songDuration) {
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
        // une al bot al canal de discord y da la capacidad de reproducir musica

        // si no estas en un canal de voz
        if (!member.voice.channel) {
            channel.send('Tienes que estar en un canal de voz!');
            return;
        }

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
            // descarga cancion
            const song = await this.playDlHandler.getSongStream(this.playList[0].songId);

            // craa recurso
            const resources = createAudioResource(song.stream, {
                inputType: song.type,
            });

            // pasa recurso al player
            this.player.play(resources);
        } catch (err) {
            console.log('ERROR', err);
            this.playList.shift();
            if (this.playList[0]) {
                return this.pauseMusic();
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
    }

    private musicEventListener() {
        this.player.on('stateChange', (oldState: AudioPlayerState, newState: AudioPlayerState) => {
            // cunado el player no esta reproduciendo
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

    public skipMusic() {
        let musicToSkip: songData;
        if (this.player) {
            musicToSkip = this.playList[0];
            this.player.stop();
            if (this.isDisplay.active) {
                this.sendPlayListDataToDisplay(false);
            }
        }
        return musicToSkip;
    }

    public pauseMusic() {
        if (!this.player || this.player._state.status === 'idle') {
            return;
        }
        this.player.pause();
        if (this.isDisplay.active) {
            this.sendPlayListDataToDisplay(false);
        }
        return;
    }

    public unpauseMusic() {
        if (!this.player) {
            return;
        }
        if (this.player._state.status === 'idle' && this.playList[0]) {
            return this.playMusic();
        }
        this.player.unpause();
        if (this.isDisplay.active) {
            this.sendPlayListDataToDisplay(false);
        }
        return;
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
        if (
            (this.player && this.player._state.status === 'idle') ||
            (this.botConnection && this.botConnection._state.status === 'destroyed')
        ) {
            this.playList = [];
        } else {
            // eleminamos todos menos el primero, que al ser el que esta sonando
            this.playList = [this.playList[0]];
        }

        if (this.isDisplay.active) {
            this.sendPlayListDataToDisplay(false);
        }
        return;
    }

    public removeSongsFromPlayList(songsIndex: number[]) {
        // si esta sonando y se quiere eliminar la primera cancion
        if (
            songsIndex.find((n) => n === 1) &&
            this.player &&
            (this.player._state.status === 'buffering' || this.player._state.status === 'playing')
        ) {
            // hace una array con las canciones selecionas
            const removedMusic = this.playList.filter((n, i) => songsIndex.includes(i + 1));

            // elimina la 1r cancion de la lista de canciones a eliminar
            songsIndex = songsIndex.filter((n) => n !== 1);

            // hace una array sin las canciones selecionas
            this.playList = this.playList.filter((n, i) => !songsIndex.includes(i + 1));

            // eliminamos la cancion que esta sonando via Skip
            this.skipMusic();

            if (this.isDisplay.active) {
                this.sendPlayListDataToDisplay(false);
            }
            return removedMusic;
        }

        // hace una array con las canciones selecionas
        const removedMusic = this.playList.filter((n, i) => songsIndex.includes(i + 1));

        // hace una array sin las canciones selecionas
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
        const newPlayList: songData[] = [];
        for (let i = this.playList.length - 1; 0 <= i; i--) {
            newPlayList.push(this.randomNextSong(i));
        }
        this.playList = newPlayList;

        if (this.isDisplay.active) {
            this.sendPlayListDataToDisplay(false);
        }

        return true;
    }

    private randomNextSong(i: number): songData {
        const randomIndex = Math.random() * Number(i);
        const randomSong = this.playList.splice(randomIndex, 1);
        return randomSong[0];
    }

    public toggleLoopMode(active: boolean): boolean {
        if (this.loopMode === active) {
            return false;
        }
        this.loopMode = active;

        if (this.isDisplay.active) {
            this.sendPlayListDataToDisplay(false);
        }

        return true;
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
}
