import { playListRepository, newSongRepository, durationRepository } from '../domain/interfaces/playListRepository'
import { CommandOutput } from "../domain/interfaces/commandOutput";
import { MessageEmbed } from 'discord.js';
import { createAudioPlayer, createAudioResource, joinVoiceChannel } from "@discordjs/voice";
const ytdl = require('ytdl-core');

export class PlayListHandler {
    // private playList: playListRepository[];
    private playList: playListRepository[] = [
        {
            songName: 'Elfen Lied - Lilium (Live at San Japan) ft. Giggles',
            songId: '-NrZmYn24mM',
            duration: { hours: 0, minutes: 3, seconds: 53, string: '3m53s' }
        },
        {
            songName: 'Dark Piano - Nil',
            songId: 'x1XxtiSam2k',
            duration: { hours: 0, minutes: 3, seconds: 30, string: '3m30s' }
        },
        {
            songName: 'Disintegrating - Myuu',
            songId: 'piFJVwr1YYA',
            duration: { hours: 0, minutes: 4, seconds: 44, string: '4m44s' }
        },
        {
            songName: 'Hopeless - Myuu',
            songId: '1kny88W533Q',
            duration: { hours: 0, minutes: 7, seconds: 42, string: '7m42s' }
        },
        {
            songName: 'Fading - Myuu',
            songId: 'nWLSW-1jJvs',
            duration: { hours: 0, minutes: 7, seconds: 55, string: '7m55s' }
        },
        {
            songName: 'Dark Piano - Dementia',
            songId: 'nxvEbqKZy-0',
            duration: { hours: 0, minutes: 7, seconds: 24, string: '7m24s' }
        },
        {
            songName: 'Dark Piano - Dementia',
            songId: 'nxvEbqKZy-0',
            duration: { hours: 0, minutes: 7, seconds: 24, string: '7m24s' }
        },
        {
            songName: 'Dark Piano - Waltz of The Mannequins',
            songId: '97kf9VrCsbk',
            duration: { hours: 0, minutes: 4, seconds: 40, string: '4m40s' }
        },
        {
            songName: 'Rise and Fall - Myuu',
            songId: 'uj3Gif77SYM',
            duration: { hours: 0, minutes: 6, seconds: 23, string: '6m23s' }
        },
        {
            songName: 'Identity Crisis - Myuu',
            songId: 'g5X6KZBk_6s',
            duration: { hours: 0, minutes: 3, seconds: 46, string: '3m46s' }
        },
        {
            songName: 'Dark Piano - Severus',
            songId: 'nPwaRCAxoso',
            duration: { hours: 0, minutes: 6, seconds: 49, string: '6m49s' }
        },
        {
            songName: 'What Could Have Been - Myuu',
            songId: '2bLCGNf--Fg',
            duration: { hours: 0, minutes: 3, seconds: 32, string: '3m32s' }
        },
        {
            songName: 'Silent Hill 3 - I Want Love (Cover) Myuu ft. @Violet Orlandi',
            songId: 'mtrf3mpuV_o',
            duration: { hours: 0, minutes: 4, seconds: 38, string: '4m38s' }
        },
        {
            songName: 'Reversion 2015 - Myuu',
            songId: 'XhZ-Ny-onfg',
            duration: { hours: 0, minutes: 4, seconds: 39, string: '4m39s' }
        },
        {
            songName: 'Dark Piano - Selfish',
            songId: 'fjGXGdLSUt8',
            duration: { hours: 0, minutes: 4, seconds: 33, string: '4m33s' }
        },
        {
            songName: 'Dark Piano - Depression',
            songId: 'S1T3UF1vhSk',
            duration: { hours: 0, minutes: 3, seconds: 41, string: '3m41s' }
        },
        {
            songName: 'Dark Fur Elise | Rainy Detuned Piano',
            songId: 'A6r3uHKDOOc',
            duration: { hours: 0, minutes: 5, seconds: 3, string: '5m3s' }
        },
        {
            songName: 'Outsider - Myuu',
            songId: 'Dlta3Qgy_6I',
            duration: { hours: 0, minutes: 4, seconds: 19, string: '4m19s' }
        },
        {
            songName: 'Tender Remains - Myuu',
            songId: '4qrFYVjsIM0',
            duration: { hours: 0, minutes: 5, seconds: 3, string: '5m3s' }
        },
        {
            songName: 'Story of Soron - Myuu',
            songId: 'IZ9L9oq_62g',
            duration: { hours: 0, minutes: 5, seconds: 39, string: '5m39s' }
        },
        {
            songName: 'Dark Piano - Psychopath',
            songId: 'GAK50LHGMfA',
            duration: { hours: 0, minutes: 5, seconds: 48, string: '5m48s' }
        }
    ]
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
        console.log(this.playList)
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
        if (this.botConnection) {
            return this.botConnection.destroy()
        }
        return
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
        console.log(playList)
        return playList
    }

    public deletePlayList() {
        if ((this.player && this.player._state.status === 'idle') || (this.botConnection && this.botConnection._state.status === 'destroyed')) {
            return this.playList = [];
        }
        // eleminamos todos menos el primero, que al ser el que esta sonando, si se elimina y se hace skip, peta
        return this.playList = [this.playList[0]];
    }
}
