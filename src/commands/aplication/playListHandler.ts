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
import { NewSong, Song, SongDuration } from '../domain/interfaces/song';
import { PlayDlService } from '../infrastructure/playDlService';
import { DisplayEmbedBuilder } from './utils/displayEmbedBuilder';
import { MessageCreator } from './utils/messageCreator';
import { PaginatedMessage } from './utils/paginatedMessage';

export class PlayListHandler {
    private playList: Song[] = [];
    private playListDuration: SongDuration;
    private botConnection: any;
    private player: any;
    private playDlService: PlayDlService;
    private displayEmbedBuilder: DisplayEmbedBuilder;
    private isMusicListenerActive = false;
    private loopMode = false;
    private isDisplay: IsDisplayActive = { active: false, event: undefined };

    constructor(playDlService: PlayDlService, displayEmbedBuilder: DisplayEmbedBuilder) {
        this.playDlService = playDlService;
        this.displayEmbedBuilder = displayEmbedBuilder;
    }

    public async update({ member, channel, newSongs }: NewSong): Promise<void> {
        this.playListDuration = this.calculateListDuration(this.playList);

        if (newSongs instanceof Array) {
            this.playList.push(...newSongs);
            await this.newListToPlayListEmbed(member, newSongs, channel);
        } else {
            this.playList.push(newSongs);
            this.newSongToPlayListEmbed(member, newSongs, channel);
        }

        // si display está activo le pasa información al constructor del embed
        if (this.isDisplay.active) {
            this.sendPlayListDataToDisplay();
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
        songList: Song[],
        channel: Message['channel'],
    ): Promise<Message> {
        const songListDuration = this.calculateListDuration(songList);

        const paginationData = this.songArrayToPaginationData(songList);

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
                        value: this.playListDuration.string,
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
                dataToPaginate: paginationData,
                dataPerPage: 10,
                timeOut: 60000,
                deleteWhenTimeOut: false,
                jsFormat: true,
                closeButton: true,
                reply: false,
            },
        }).call();
    }

    private songArrayToPaginationData(songList: Song[]): string[] {
        const playListString: string[] = songList.map((song: Song, i: number) =>
            this.mapPagesData(song, i),
        );
        return playListString;
    }

    private mapPagesData(songData: Song, index: number): string {
        const songsString = `${index + 1} - ${songData.songName} '${songData.duration.string}'\n`;

        return songsString;
    }

    private newSongToPlayListEmbed(
        member: GuildMember,
        newSong: Song,
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
                        value: this.playListDuration.string,
                        inline: true,
                    },
                    {
                        name: 'Loop',
                        value: this.loopMode ? 'on' : 'off',
                        inline: true,
                    },
                ],
                thumbnailUrl: newSong.thumbnails ?? '',
            },
        }).call();

        return channel.send(output);
    }

    private calculateListDuration(songList: Song[]): SongDuration {
        const listDuration: SongDuration = { hours: 0, minutes: 0, seconds: 0, string: '0s' };
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
        listDuration.string = this.getQeueDuration(listDuration);
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
            return `${minutes}m ${seconds}s`;
        }

        return `${seconds}s`;
    }

    private joinToChannel(member: GuildMember, channel: any): void {
        // une al bot al canal de discord y da la capacidad de reproducir musica
        this.botConnection = joinVoiceChannel({
            channelId: member.voice.channel!.id,
            guildId: channel.guild.id,
            adapterCreator: channel.guild.voiceAdapterCreator,
            selfDeaf: true,
        });

        this.player = createAudioPlayer();

        this.botConnection.subscribe(this.player);

        if (this.isDisplay.active) {
            this.sendPlayListDataToDisplay();
        }
    }

    private async playMusic(): Promise<void> {
        try {
            // descarga cancion
            const song = await this.playDlService.getSongStream(this.playList[0].songId);

            // craa recurso
            const resources = createAudioResource(song.stream, {
                inputType: song.type,
            });

            // pasa recurso al player
            this.player.play(resources);
        } catch (err) {
            console.log('Play ERROR: ', err);
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
            this.sendPlayListDataToDisplay();
        }
        return;
    }

    private musicEventListener(): void {
        this.player.on('stateChange', (oldState: AudioPlayerState, newState: AudioPlayerState) => {
            if (this.isDisplay.active) {
                this.sendPlayListDataToDisplay();
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
                this.sendPlayListDataToDisplay();
            }
            return;
        }
        return;
    }

    public async skipMusic(): Promise<Song | void> {
        let musicToSkip: Song | undefined = undefined;

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
                this.sendPlayListDataToDisplay();
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
        if (!this.player || !this.playList[0]) {
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
        if (event.member?.voice.channel) {
            this.joinToChannel(event.member, event.channel);
            if (this.playList[0]) {
                this.playMusic();
            }
        }
        return;
    }

    public readPlayList(): string[] {
        const playList = this.songArrayToPaginationData([...this.playList]);
        return playList;
    }

    public deletePlayList() {
        if (this.playList[0] && this.player) {
            this.playList = [];
            this.player.stop();

            this.player._state.status = 'idle';

            if (this.isDisplay.active) {
                this.sendPlayListDataToDisplay();
            }
            return true;
        }
        return false;
    }

    public removeSongsFromPlayList(songsIndex: number[]): string[] {
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

            const removedMusicString = this.songArrayToPaginationData(removedMusic);
            return removedMusicString;
        }

        // hace una array con las canciones selecionas
        const removedMusic = this.playList.filter((n, i) => songsIndex.includes(i + 1));

        // hace una array sin las canciones selecionas
        this.playList = this.playList.filter((n, i) => !songsIndex.includes(i + 1));

        if (this.isDisplay.active) {
            this.sendPlayListDataToDisplay();
        }
        const removedMusicString = this.songArrayToPaginationData(removedMusic);
        return removedMusicString;
    }

    public shufflePlayList(): boolean {
        if (!this.playList[0]) {
            return false;
        }
        const newPlayList: Song[] = [];

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
            this.sendPlayListDataToDisplay();
        }

        return true;
    }

    private randomNextSong(i: number): Song {
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
            this.sendPlayListDataToDisplay();
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

    private sendPlayListDataToDisplay(newEmbed = false): Promise<void | DisplayMessage> {
        const playListData = this.readPlayListStatus();

        return this.displayEmbedBuilder.call(playListData, this.isDisplay.event, newEmbed);
    }

    public logPlaylistStatus(): void {
        console.log('PLAYER: ', this.player ?? null);
        console.log('BOTCONNECTION: ', this.botConnection ?? null);
        console.log('PLAYLIST: ', this.playList);
        return;
    }

    public putSongInFirstPoistionOfPlaylist(songIndex: number): Song | void {
        const chosenMusic = this.playList.find((n, i) => songIndex === i + 1);
        if (chosenMusic) {
            // remove chosen song
            this.playList = this.playList.filter((n, i) => !(songIndex === i + 1));
            // place it in first place
            this.playList.unshift(chosenMusic);
            this.playMusic();
            return chosenMusic;
        }
    }
}
