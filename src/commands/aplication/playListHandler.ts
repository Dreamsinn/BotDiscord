import {
    AudioPlayerState,
    createAudioPlayer,
    createAudioResource,
    joinVoiceChannel,
} from '@discordjs/voice';
import { GuildMember, Message } from 'discord.js';
import { TogglePauseOutputEnums } from '../domain/enums/togglePauseOutputEnums';
import { DisplayMessage } from '../domain/interfaces/displayMessage';
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

    public async update({ member, channel, songList, newSong }: NewSongData): Promise<void> {
        // si no estas en un canal de voz
        if (songList) {
            this.playList.push(...songList);
        } else {
            this.playList.push(newSong);
        }

        // calcula el tiempo total de la cola, lo hace despues del embed porque el tiempo del acancion no entra en el tiempo de espera
        this.playListDuration = this.calculateListDuration(this.playList);

        if (songList) {
            await this.newListToPlayListEmbed(member, songList, channel);
        } else {
            this.newSongToPlayListEmbed(member, newSong, channel);
        }

        // si display está activo le pasa información al constructor del embed
        if (this.isDisplay.active) {
            this.sendPlayListDataToDisplay(false);
        }

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
        songList: SongData[],
        channel: Message['channel'],
    ): Promise<Message> {
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

    private newSongToPlayListEmbed(
        member: GuildMember,
        newSong: SongData,
        channel: Message['channel'],
    ): Promise<Message> {
        const output = new MessageCreator({
            embed: {
                color: '#0099ff',
                title: newSong.songName ?? 'Ha habido un error a la hora de coger el nombre',
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
                thumbnailUrl: newSong.thumbnails ?? null,
            },
        }).call();

        return channel.send(output);
    }

    private calculateListDuration(songList: SongData[]): SongDuration {
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

    private getQeueDuration(listDuration: SongDuration): string {
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

    private joinToChannel(member: GuildMember, channel: any): void {
        // une al bot al canal de discord y da la capacidad de reproducir musica

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

    private async playMusic(): Promise<void> {
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

    private musicEventListener(): void {
        this.player.on('stateChange', (oldState: AudioPlayerState, newState: AudioPlayerState) => {
            if (this.isDisplay.active) {
                this.sendPlayListDataToDisplay(false);
            }

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

    public readPlayListStatus(): PlayListStatus {
        const playListData: PlayListStatus = {
            playList: this.playList,
            playListDuration: this.getQeueDuration(this.calculateListDuration(this.playList)),
            loop: this.loopMode,
            playerStatus: this.player ? this.player._state.status : undefined,
            conectionStatus: this.botConnection ? this.botConnection._state.status : undefined,
        };

        return playListData;
    }

    public botDisconnect(): void {
        if (this.botConnection) {
            this.botConnection.destroy();
            if (this.isDisplay.active) {
                this.sendPlayListDataToDisplay(false);
            }
            return;
        }
        return;
    }

    public async skipMusic(): Promise<SongData | void> {
        let musicToSkip: SongData;

        if (!this.player) {
            return;
        }

        if (this.player._state.status === 'paused') {
            // arregla el bug que el display no saltava las canciones cuando la musica estava en pause
            // buscar mejor solucion que modificar un readonly
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

    public changeBotVoiceChanel(event: Message): void {
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
        if (this.player) {
            this.playList = [];
            this.player.stop();

            this.player._state.status = 'idle';

            if (this.isDisplay.active) {
                this.sendPlayListDataToDisplay(false);
            }
            return true;
        }
        return false;
    }

    public removeSongsFromPlayList(songsIndex: number[]): SongData[] {
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
        const newPlayList: SongData[] = [];

        // si esta sonando, para que no cambie el orden de la primera
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

    public deactivateDisplay(): void {
        this.isDisplay.active = false;
        this.isDisplay.event = undefined;
        return;
    }

    public activateDispaly(event: Message): Promise<DisplayMessage | void> {
        this.isDisplay.active = true;
        this.isDisplay.event = event;

        return this.sendPlayListDataToDisplay(true);
    }

    private sendPlayListDataToDisplay(newEmbed: boolean) {
        const playListData = this.readPlayListStatus();

        return this.displayEmbedBuilder.call(playListData, this.isDisplay.event, newEmbed);
    }

    public logPlaylistStatus(): void {
        console.log('PLAYER: ', this.player ?? null);
        console.log('BOTCONNECTION: ', this.botConnection ?? null);
        console.log('PLAYLIST: ', this.playList);
        return;
    }
}
