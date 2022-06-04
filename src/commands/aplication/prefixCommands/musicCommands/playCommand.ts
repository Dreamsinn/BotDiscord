import { DiscordRequestRepo } from "../../../domain/interfaces/discordRequestRepo";
import { PlayCommandSchema } from "../../../domain/commandSchema/playCommandSchema";
import { Command } from "../../../aplication/Command";
import { YoutubeAPIHandler } from "../../../infrastructure/youtubeHandler";
import { PlayDlHandler } from "../../../infrastructure/playDlHandler"
import { MessageEmbed } from 'discord.js';
import { CommandOutput } from "../../../domain/interfaces/commandOutput";
import { discordEmojis } from "../../../domain/discordEmojis";
import { newSongRepository } from "../../../domain/interfaces/playListRepository";
import { PlayListHandler } from "../../playListHandler"
import { CoolDown } from "../../utils/coolDown";
import { UsersUsingACommand } from "../../utils/usersUsingACommand"
import { YouTubeVideo } from "play-dl";
import { SearchedSongRepository } from "../../../domain/interfaces/searchedSongRepository";

export class PlayCommand extends Command {
    private playSchema: DiscordRequestRepo = PlayCommandSchema;
    private coolDown = new CoolDown();
    private usersUsingACommand = UsersUsingACommand.usersUsingACommand;
    private youtubeAPIHandler: YoutubeAPIHandler;
    private playListHandler: PlayListHandler;
    private playDlHandler: PlayDlHandler;

    constructor(
        youtubeAPIHandler: YoutubeAPIHandler,
        playListHandler: PlayListHandler,
        playDlHandler: PlayDlHandler,
    ) {
        super();
        this.youtubeAPIHandler = youtubeAPIHandler;
        this.playListHandler = playListHandler;
        this.playDlHandler = playDlHandler;
    }

    // si es menor que 3 esque tiene prefijo pero no contenido
    public async call(event) {
        // si el mensaje no es mas largo que "~p " no tiene contenido
        if (event.content.length < 3) {
            return;
        }

        //comprobar coolDown
        const interrupt = this.coolDown.call(this.playSchema.coolDown);
        if (interrupt === 1) {
            console.log('command interrupted by cooldown')
            return;
        }

        const argument = event.content.substring(3)

        // si buscas por enlace
        if (argument.includes('youtube.com/watch?v=')) {
            return this.findSongIdFromYoutubeURL(argument, event)
        } else {
            // si buscas por nombre de cancion
            return this.searchBySongName(argument, event);
        }
    }

    private async searchBySongName(argument: string, event) {
        let response: SearchedSongRepository[];

        try {
            response = await this.playDlHandler.searchSongByName(argument)
        } catch (err) {
            console.log(err)
            event.channel.send(err)

            try {
                // respuesta de la api de youtube
                response = await this.youtubeAPIHandler.searchSongByName(argument, event);
            } catch (err) {
                event.channel.send(`It has not been possible to get song's options`)
                console.log(err)
                event.channel.send(err)
                return
            }
        }

        if (!response[0]) {
            event.channel.send('No hay coincidencias')
            return;
        }

        const { embed, numberChoices } = this.createSelectChoicesEmbed(response);

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

        message.channel.awaitMessages({ filter, time: 20000, max: 1, errors: ['time'] })
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

                const song: SearchedSongRepository = response[numberSelected];

                // conseguimos la id y la pasamos
                this.updateToPlayList(event, song);
                // eliminamos a la persona de la lista
                this.usersUsingACommand.removeUserList(event.author.id)
                // eleminamos opciones
                message.delete();
                // eliminamos la respuesta a la opciones
                collectedMessage.delete();
            })
            .catch((err) => {
                if (err instanceof TypeError) {
                    console.log(err)
                    event.channel.send(`Error: ${err.message}`)
                } else {
                    // sino contesta
                    console.log(`No answer`);
                    event.reply('Time out')
                }

                this.usersUsingACommand.removeUserList(event.author.id)
                message.delete();
                return;
            })
    }

    private createSelectChoicesEmbed(songList: SearchedSongRepository[]) {
        // pasa un embed al discord para que elija exactamente cual quiere
        let embedContent = '```js\n';

        songList.forEach((song, i) => {
            embedContent += `${i + 1} - ${song.title}\n`
        })

        embedContent += `${discordEmojis.x} - Cancel\n` + '```'

        const embed = new MessageEmbed()
            .setColor('#0099ff')
            .addFields({ name: 'Escriba el número de la canción que quiera seleccionar', value: embedContent, inline: false })

        // devuelve el embed y el numero de eleciones 
        return { embed, numberChoices: songList.length };
    }

    private findSongIdFromYoutubeURL(url: string, event) {
        const rawSongId = url
            .replace('https://', '')
            .replace('www.', '')
            .replace('youtube.com/watch?v=', '')

        const URLParametersPosition = rawSongId.indexOf('&')

        if (URLParametersPosition === -1) {
            const song: SearchedSongRepository = { id: rawSongId }
            return this.updateToPlayList(event, song)
        }

        const song: SearchedSongRepository = { id: rawSongId.substring(0, URLParametersPosition) }

        return this.updateToPlayList(event, song)

    }

    private async updateToPlayList(event, song: SearchedSongRepository) {
        let duration: any;

        try {
            // llamada api para duracion del vidio y nombre
            const songData: YouTubeVideo = await this.playDlHandler.getSongInfo(song.id)
            song.title ? song.title : songData.title;
            duration = this.parseSongDuration(String(songData.durationInSec), true)
        } catch (err) {
            event.channel.send(`Error: ${err}`)
            console.log(`Error: ${err}`)

            try {
                // si falla play-dl la llamamos a la api de google, para que sea mas dificil llegar al limite
                const songData = await this.youtubeAPIHandler.searchSongById(song.id);
                duration = this.parseSongDuration(songData.data.items[0].contentDetails.duration, false)
            } catch (err) {
                event.channel.send(`It has not been possible to get song's information`)
                event.channel.send(`Error: ${err}`)
                console.log(`Error: ${err}`)
            }
        }

        const newSong: newSongRepository = {
            songName: song.title,
            songId: song.id,
            duration: duration,
            channel: event.channel,
            member: event.member
        }

        return this.playListHandler.update(newSong);
    }

    private parseSongDuration(durationString = "", onlySeconds: boolean) {
        if (onlySeconds) {
            // si cojemos la de play-dl, lo pasamos al formato de la respuesta de youtube
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
