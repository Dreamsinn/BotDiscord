import { DiscordRequestRepo } from "../../../domain/interfaces/discordRequestRepo";
import { PlayCommandSchema } from "../../../domain/commandSchema/playCommandSchema";
import { Command } from "../../../aplication/Command";
import { YoutubeSearch } from "../../../infrastructure/youtube.ts/youtubeHandler";
import { MessageEmbed } from 'discord.js';
import { CommandOutput } from "../../../domain/interfaces/commandOutput";
import { discordEmojis } from "../../../domain/discordEmojis";
import { newSongRepository } from "../../../domain/interfaces/playListRepository";
import { PlayListHandler } from "../../playListHandler"
import { CoolDown } from "../../utils/coolDown";
import { UsersUsingACommand } from "../../utils/usersUsingACommand"
const ytdl = require('ytdl-core');

export class PlayCommand extends Command {
    private playSchema: DiscordRequestRepo = PlayCommandSchema;
    private coolDown = new CoolDown();
    private usersUsingACommand = UsersUsingACommand.usersUsingACommand;
    private youtubeSearch: YoutubeSearch;
    private playListHandler: PlayListHandler;

    constructor(
        youtubeSearch: YoutubeSearch,
        playListHandler: PlayListHandler,
    ) {
        super();
        this.youtubeSearch = youtubeSearch;
        this.playListHandler = playListHandler;
    }

    // si es menor que 3 esque tiene prefijo pero no contenido
    public async call(event) {
        // si el mensaje no es mas largo que "~p " no tiene contenido
        if (event.content.length < 3) {
            return;
        }

        // si el usurio esta en la array esque ha buscado una cancion pero aun no a resuelto el embed
        if (this.usersUsingACommand.searchIdInUserList(event.author.id)) {
            event.channel.send('Antes de buscar otra cancion, resuelve el mensaje anterio!')
            return;
        }

        //comprobar coolDown
        const interrupt = this.coolDown.call(this.playSchema.coolDown);
        if (interrupt === 1) {
            console.log('command interrupted by cooldown')
            return;
        }

        const song = event.content.substring(3)

        // si buscas por enlace
        if (song.includes('youtube.com/watch?v=')) {
            return this.findSongIdFromYoutubeURL(song, event)
        } else {
            // si buscas por nombre de cancion
            return this.searchBySongName(song, event);
        }
    }

    private async searchBySongName(song: string, event) {
        // respuesta de la api de youtube
        const response = await this.youtubeSearch.searchSongByName(song);

        // si estatus no es OK, que no retorne nada
        if (!response.status) {
            console.log('ERROR', response)
            const output: CommandOutput = {
                content: `Error Code: ${response.code}\nMessage: ${response.message}\nReason: ${response.errors[0].reason}`,
            }
            return await event.reply(output);
        }

        console.log(response.data.items)
        if (!response.data.items[0]) {
            event.channel.send('No hay coincidencias')
            return;
        }

        const { embed, numberChoices } = this.createSelectChoicesEmbed(response.data.items);

        const output: CommandOutput = {
            embeds: [embed],
        }

        this.usersUsingACommand.updateUserList(event.author.id)

        // enviar respuesta con opciones
        const message = await event.reply(output)

        const filter = (reaction) => {
            // si el autor es el mismo, y el mensaje contiene X, 0 o un numero entre 0 y las numero de opciones
            return event.author.id === reaction.author.id && (reaction.content === 'x' || (Number(reaction.content) && Number(reaction.content) > 0 && Number(reaction.content) < numberChoices));
        };

        message.channel.awaitMessages({ filter, time: 20000, max: 1 })
            .then((collected: any) => {
                let collectedMessage: any;
                collected.map((e: any) => collectedMessage = e);

                // Si se responde una X se borra el mensaje
                if (collectedMessage.content === 'x') {
                    console.log('Search cancelled');
                    event.reply('Search cancelled');
                    this.usersUsingACommand.removeUserList(event.author.id)
                    message.delete();
                    collectedMessage.delete();
                    return;
                };
                // si ningun caso anterior
                const numberSelected = Number((collectedMessage.content) - 1)

                const songId = response.data.items[numberSelected].id.videoId;

                // conseguimos la id y la pasamos
                this.updateToPlayList(event, songId);
                // eliminamos a la persona de la lista
                this.usersUsingACommand.removeUserList(event.author.id)
                // eleminamos opciones
                message.delete();
                // eliminamos la respuesta a la opciones
                collectedMessage.delete();
            })
            .catch(() => {
                // sino contesta
                console.log(`No answer`);
                this.usersUsingACommand.removeUserList(event.author.id)
                message.delete();
                event.reply('Time out')
                return;
            })
    }

    private createSelectChoicesEmbed(data: any[]) {
        // pasa un embed al discord para que elija exactamente cual quiere
        let embedContent = '```js\n';

        data.forEach((item, i) => {
            embedContent += `${i + 1} - ${item.snippet.title}\n`
        })

        embedContent += `${discordEmojis.x} - Cancel\n` + '```'

        const embed = new MessageEmbed()
            .setColor('#0099ff')
            .addFields({ name: 'Escriba el número de la canción que quiera seleccionar', value: embedContent, inline: false })

        // devuelve el embed y el numero de eleciones 
        return { embed, numberChoices: data.length };
    }

    private findSongIdFromYoutubeURL(url: string, event) {
        const rawSongId = url
            .replace('https://', '')
            .replace('www.', '')
            .replace('youtube.com/watch?v=', '')

        const URLParametersPosition = rawSongId.indexOf('&')

        if (URLParametersPosition === -1) {
            return this.updateToPlayList(event, rawSongId)
        }

        const songId = rawSongId.substring(0, URLParametersPosition)

        return this.updateToPlayList(event, songId)

    }

    private async updateToPlayList(event, songId) {
        // llamada api para duracion del vidio

        let songName: string;

        let duration: any;

        try {
            const songData = await ytdl.getBasicInfo(`https://www.youtube.com/watch?v=${songId}`)
            songName = songData.videoDetails.title
            duration = this.parseSongDuration(songData.videoDetails.lengthSeconds, true)
        } catch (err) {
            event.channel.send(`Error: ${err}`)
            console.log(`Error: ${err}`)

            // si falla ytdl la llamamos a la api de google, para que sea mas dificil llegar al limite
            const songData = await this.youtubeSearch.searchSongById(songId);
            duration = this.parseSongDuration(songData.data.items[0].contentDetails.duration, false)
        }

        const newSong: newSongRepository = {
            songName: songName,
            songId: songId,
            duration: duration,
            channel: event.channel,
            member: event.member
        }

        return this.playListHandler.update(newSong);
    }

    private parseSongDuration(durationString = "", onlySeconds: boolean) {
        if (onlySeconds) {
            // si cojemos la de ydtl, lo pasamos al formato de la respuesta de youtube
            const duration = Number(durationString);
            const hours = Math.floor(duration / 3600);
            const minutes = Math.floor(duration % 3600 / 60);
            const seconds = Math.floor(duration % 3600 % 60);

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
            .replace("PT", "")
            .replace("H", ":")
            .replace("M", ":")
            .replace("S", "")
            .split(":");

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
