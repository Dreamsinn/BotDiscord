import { playListRepository, newSongRepository, durationRepository } from '../domain/interfaces/playListRepository'
import { CommandOutput } from "../domain/interfaces/commandOutput";
import { MessageEmbed } from 'discord.js';
import { createAudioPlayer, createAudioResource, joinVoiceChannel } from "@discordjs/voice";
const ytdl = require('ytdl-core');

export class PlayListHandler {
    private playList: playListRepository[];
    private playListDuration: durationRepository = { hours: 0, minutes: 0, seconds: 0 };
    private botConnection: any;
    private player: any;

    public async update({ member, channel, ...newSong }: newSongRepository) {
        if (this.playList === undefined) {
            // sino esta iniciada, es igual a la cancion
            this.playList = [newSong]
        } else {
            // si la array esta inicaida, hace push de la cancion
            this.playList.push(newSong);
        }

        // si no estas en un canal de voz
        if (!member.voice.channel) {
            channel.send('Tienes que estar en un canal de voz!')
            return;
        }

        const embed = this.newSongToPlayListEmbed(member, newSong)

        // calcula el tiempo total de la cola, lo hace despues del embed porque el tiempo del acancion no entra en el tiempo de espera
        this.calculateQeueDuration();

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

    private newSongToPlayListEmbed(member, { ...newSong }) {
        const embed = new MessageEmbed()
            .setColor('#0099ff')
            .setTitle(newSong.songName ? `${newSong.songName}` : 'Ha habido un error a la hora de coger el nombre')
            .setAuthor({ name: `${member.user.username}`, iconURL: `${member.user.displayAvatarURL()}` })
            .setURL(`https://www.youtube.com/watch?v=${newSong.songId}`)
            .addFields(
                { name: 'Duracion', value: `${newSong.duration.string}`, inline: true },
                { name: 'Posicion', value: `${this.playList.length}`, inline: true },
                { name: 'Espera', value: `${this.getQeueDuration()}`, inline: true },
            )

        // devuelve el embed
        return embed;
    }

    private calculateQeueDuration() {
        this.playListDuration = { hours: 0, minutes: 0, seconds: 0 };
        this.playList.forEach((song) => {
            this.playListDuration.seconds += song.duration.seconds;
            this.playListDuration.minutes += song.duration.minutes;
            this.playListDuration.hours += song.duration.hours;

            if (this.playListDuration.seconds >= 60) {
                this.playListDuration.seconds -= 60;
                this.playListDuration.minutes += 1;
            }

            if (this.playListDuration.minutes >= 60) {
                this.playListDuration.minutes -= 60;
                this.playListDuration.hours += 1;
            }
        })
    }

    private getQeueDuration() {
        const hours = this.playListDuration.hours;
        const minutes = this.playListDuration.minutes;
        const seconds = this.playListDuration.seconds;

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
            const song = await ytdl(`https://www.youtube.com/watch?v=${this.playList[0].songId}`, { filter: "audioonly" })
            // craa recurso
            const resources = createAudioResource(song)
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
        return this.botConnection.destroy()
    }

    public skipMusic() {
        const musicToSkip = this.playList[0]
        this.player.stop()
        this.playList.shift()
        if (this.playList[0]) {
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
}
