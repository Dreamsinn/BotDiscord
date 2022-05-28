import { playListRepository, newSongRepository, durationRepository } from '../domain/interfaces/playListRepository'
import { CommandOutput } from "../domain/interfaces/commandOutput";
import { MessageEmbed } from 'discord.js';
export class PlayListHandler {
    private playList: [playListRepository];
    private playListDuration: durationRepository = { hours: 0, minutes: 0, seconds: 0 };

    public async update({ user, channel, ...newSong }: newSongRepository) {
        if (this.playList === undefined) {
            // sino esta iniciada, es igual a la cancion
            this.playList = [newSong]
        } else {
            // si la array esta inicaida, hace push de la cancion
            this.playList.push(newSong);
        }

        const embed = this.newSongToPlayListEmbed(user, newSong)

        // calcula el tiempo total de la cola, lo hace despues del embed porque el tiempo del acancion no entra en el tiempo de espera
        this.calculateQeueDuration(newSong.duration);

        const output: CommandOutput = {
            embeds: [embed],
        }

        channel.send(output)

        // TODO: reproducir primera cancion array y con una funcion autoejecutable, con un if(array no vacia) y im cooldown = al timepo de la cancion

    }

    private newSongToPlayListEmbed(user, { ...newSong }) {
        const embed = new MessageEmbed()
            .setColor('#0099ff')
            .setTitle(`${newSong.songName}`)
            .setAuthor({ name: `${user.username}`, iconURL: `${user.displayAvatarURL()}` })
            .setURL(`https://www.youtube.com/watch?v=${newSong.songId}`)
            .addFields(
                { name: 'Duracion', value: `${newSong.duration.string}`, inline: true },
                { name: 'Posicion', value: `${this.playList.length}`, inline: true },
                { name: 'Espera', value: `${this.getQeueDuration()}`, inline: true },
            )

        // devuelve el embed
        return embed;
    }

    private calculateQeueDuration(newSong: durationRepository) {
        this.playListDuration.seconds += newSong.seconds;
        this.playListDuration.minutes += newSong.minutes;
        this.playListDuration.hours += newSong.hours;

        if (this.playListDuration.seconds >= 60) {
            this.playListDuration.seconds -= 60;
            this.playListDuration.minutes += 1;
        }

        if (this.playListDuration.minutes >= 60) {
            this.playListDuration.minutes -= 60;
            this.playListDuration.hours += 1;
        }
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



}