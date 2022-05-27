import { playListRepository } from '../domain/interfaces/playListRepository'
import { CommandOutput } from "../domain/interfaces/commandOutput";
import { MessageEmbed } from 'discord.js';
import { YoutubeSearch } from '../infrastructure/youtube.ts/youtubeHandler'



export class PlayListHandler {
    private playList: [playListRepository];
    private youtubeSearch: YoutubeSearch;

    constructor(
        youtubeSearch: YoutubeSearch
    ) {
        this.youtubeSearch = youtubeSearch;
    }

    public async update(newSong: playListRepository) {
        if (this.playList === undefined) {
            // sino esta iniciada, es igual a la cancion
            this.playList = [newSong]
        } else {
            // si la array esta inicaida, hace push de la cancion
            this.playList.push(newSong);
        }

        const embed = this.newSongToPlayListEmbed(newSong)


        const output: CommandOutput = {
            embeds: [embed],
        }

        newSong.channel.send(output)

        const song = await this.youtubeSearch.searchSongByURL(newSong.songId)
        console.log(song.data.items[0])

        // TODO: enviar un embed en el canal de la cancion con nombre y posicion en array
        // newSong.channel.send('a')
        // TODO: reproducir primera cancion array y con una funcion autoejecutable, con un if(array no vacia) y im cooldown = al timepo de la cancion

    }

    private newSongToPlayListEmbed(newSong: playListRepository) {

        console.log(newSong.user)

        const embed = new MessageEmbed()
            .setColor('#0099ff')
            .setTitle(`${newSong.songName}`)
            .setAuthor({ name: `${newSong.user.username}`, iconURL: `${newSong.user.displayAvatarURL()}` })
            .setURL(`https://www.youtube.com/watch?v=${newSong.songId}`)

        console.log(newSong.songId)
        // .addFields(
        //     { name: 'Descripcion', value: `${typeCommand[1].description}`, inline: false },
        //     { name: 'Alias', value: `${typeCommand[1].aliases}`, inline: false },
        //     { name: 'Cooldown', value: `${typeCommand[1].coolDown} ms`, inline: false },
        // )

        // devuelve el embed y el numero de eleciones 
        return embed;
    }


}