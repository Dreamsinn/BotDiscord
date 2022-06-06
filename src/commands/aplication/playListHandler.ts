import { playListRepository, newSongRepository, durationRepository } from '../domain/interfaces/playListRepository'
import { CommandOutput } from "../domain/interfaces/commandOutput";
import { MessageEmbed } from 'discord.js';
import { createAudioPlayer, createAudioResource, joinVoiceChannel } from "@discordjs/voice";
import { PlayDlHandler } from '../infrastructure/playDlHandler'

export class PlayListHandler {
    private playList: playListRepository[] = [];
    private playListDuration: durationRepository = { hours: 0, minutes: 0, seconds: 0 };
    private botConnection: any;
    private player: any;

    private playDlHandler: PlayDlHandler;

    constructor(
        playDlHandler: PlayDlHandler,
    ) {
        this.playDlHandler = playDlHandler;
    }

    public async update({ member, channel, songList, newSong }: newSongRepository) {
        if (songList) {
            this.playList.push(...songList)
        } else {
            this.playList.push(newSong);
        }

        let embed;
        if (songList) {
            embed = this.newListToPlayListEmbed(member, songList)
        } else {
            embed = this.newSongToPlayListEmbed(member, newSong)
        }

        // calcula el tiempo total de la cola, lo hace despues del embed porque el tiempo del acancion no entra en el tiempo de espera
        this.playListDuration = this.calculateListDuration(this.playList, this.playListDuration);

        const output: CommandOutput = {
            embeds: [embed],
        }

        channel.send(output)

        // si no hay conexion o se ha desconectado el bot dle canal de voz, que entablezca una nueva conexion
        if (!this.botConnection || this.botConnection._state.status === 'destroyed') {
            this.joinToChannel(member, channel);
        }

        // si el player no esta reproduciendo
        if (this.player._state.status === 'idle') {
            this.playMusic();
        }
    }

    private newListToPlayListEmbed(member, songList) {
        // TODO: descripcion con lista de todas las canciones, mas adelante, con paginacion de 20s y sin mensaje de Time Out
        let songListDuration: durationRepository;
        songListDuration = this.calculateListDuration(songList, songListDuration);

        let songNameList = '';
        songList.forEach((song: playListRepository, i: number) => {
            console.log(song)
            songNameList += `${i + 1} - ${song.songName}\n`
        })
        console.log(songNameList)
        const embed = new MessageEmbed()
            .setColor('#0099ff')
            .setTitle(`${songList.length} added to playlist`)
            .setAuthor({ name: `${member.user.username}`, iconURL: `${member.user.displayAvatarURL()}` })
            .setDescription(songNameList)
            .addFields(
                { name: 'Duracion', value: `${this.getQeueDuration(songListDuration)}`, inline: true },
                { name: 'Posicion', value: `${this.playList.length + 1 - songList.length}`, inline: true },
                { name: 'Espera', value: `${this.getQeueDuration(this.playListDuration)}`, inline: true },
            )

        // devuelve el embed
        return embed;
    }

    private newSongToPlayListEmbed(member, newSong: playListRepository) {

        const embed = new MessageEmbed()
            .setColor('#0099ff')
            .setTitle(newSong.songName ? `${newSong.songName}` : 'Ha habido un error a la hora de coger el nombre')
            .setAuthor({ name: `${member.user.username}`, iconURL: `${member.user.displayAvatarURL()}` })
            .setURL(`https://www.youtube.com/watch?v=${newSong.songId}`)
            .addFields(
                { name: 'Duracion', value: `${newSong.duration.string}`, inline: true },
                { name: 'Posicion', value: `${this.playList.length}`, inline: true },
                { name: 'Espera', value: `${this.getQeueDuration(this.playListDuration)}`, inline: true },
            )

        // devuelve el embed
        return embed;
    }

    private calculateListDuration(songList: playListRepository[], listDuration: durationRepository) {
        listDuration = { hours: 0, minutes: 0, seconds: 0 };
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
        })
        return listDuration
    }

    private getQeueDuration(listDuration: durationRepository) {
        const hours = listDuration.hours;
        const minutes = listDuration.minutes;
        const seconds = listDuration.seconds;

        if (hours !== 0) {
            return `${hours}h ${minutes}m ${seconds}s`
        }

        if (hours == 0 && minutes !== 0) {
            return `${minutes}m ${seconds}s`
        }

        return `${seconds}s`
    }

    private joinToChannel(member: any, channel: any) {
        // une al bot al canal de discord y da la capacidad de reproducir musica
        this.botConnection = joinVoiceChannel({
            channelId: member.voice.channel.id,
            guildId: channel.guild.id,
            adapterCreator: channel.guild.voiceAdapterCreator,
            selfDeaf: true,
        })

        this.player = createAudioPlayer()


        this.botConnection.subscribe(this.player)
    }

    private async playMusic() {
        try {
            // descarga cancion
            const song = await this.playDlHandler.getSongStream(this.playList[0].songId)

            // craa recurso
            const resources = createAudioResource(song.stream, {
                inputType: song.type
            })

            // pasa recurso al player
            this.player.play(resources)
        } catch (err: any) {
            console.log('ERROR', err)
            this.playList.shift()
            if (this.playList[0]) {
                this.playMusic()
            }
            return
        }

        this.player.on('stateChange', (oldState, newState) => {
            // cunado el player no esta reproduciendo
            if (newState.status === 'idle') {
                this.playList.shift()
                if (this.playList[0]) {
                    this.playMusic()
                }
                return
            }
        })
    }

    public botDisconnect() {
        if (this.botConnection) {
            return this.botConnection.destroy()
        }
        return
    }

    public skipMusic() {
        const musicToSkip = this.playList[0]
        this.player.stop()
        this.playList.shift()
        if (this.playList[0] && this.player && this.player._state.status !== 'paused') {
            this.playMusic()
        }
        return musicToSkip;
    }

    public pauseMusic() {
        if (!this.player || this.player._state.status === 'idle') {
            return
        }
        return this.player.pause()
    }

    public unpauseMusic() {
        if (!this.player || this.player._state.status === 'idle') {
            return
        }
        return this.player.unpause()
    }

    public changeBotVoiceChanel(event) {
        this.joinToChannel(event.member, event.channel)
        this.playMusic()
        return
    }

    public readPlayList() {
        const playList = this.playList.slice(0)
        return playList
    }

    public deletePlayList() {
        if ((this.player && this.player._state.status === 'idle') || (this.botConnection && this.botConnection._state.status === 'destroyed')) {
            return this.playList = [];
        }
        // eleminamos todos menos el primero, que al ser el que esta sonando, si se elimina y se hace skip, peta
        return this.playList = [this.playList[0]];
    }

    public removeSongsFromPlayList(songsIndex: number[]) {
        // si esta sonando y se quiere eliminar la primera cancion
        if (songsIndex.find((n) => n === 1) && (this.player && (this.player._state.status === 'buffering' || this.player._state.status === 'playing'))) {

            // hace una array con las canciones selecionas
            const removedMusic = this.playList.filter((n, i) => {
                return songsIndex.includes(i + 1)
            })

            // elimina la 1r cancion de la lista de canciones a eliminar
            songsIndex = songsIndex.filter(n => n !== 1)

            // hace una array sin las canciones selecionas
            this.playList = this.playList.filter((n, i) => {
                return !songsIndex.includes(i + 1)
            })

            // eliminamos la cancion que esta sonando via Skip
            this.skipMusic()

            return removedMusic;
        }

        // hace una array con las canciones selecionas
        const removedMusic = this.playList.filter((n, i) => {
            return songsIndex.includes(i + 1)
        })

        // hace una array sin las canciones selecionas
        this.playList = this.playList.filter((n, i) => {
            return !songsIndex.includes(i + 1)
        })

        return removedMusic;
    }
}