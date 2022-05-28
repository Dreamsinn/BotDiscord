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


export class PlayCommand extends Command {
    playSchema: DiscordRequestRepo = PlayCommandSchema;
    coolDown = new CoolDown();
    youtubeSearch: YoutubeSearch;
    playListHandler: PlayListHandler;
    usersSearchingASong = [];

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
        if (this.usersSearchingASong.find((id) => id === event.author.id)) {
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
            // TODO: que busque por enlace
            return;
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

        const { embed, numberChoices } = this.createSelectChoicesEmbed(response.data.items);

        const output: CommandOutput = {
            embeds: [embed],
        }

        this.usersSearchingASong.push(event.author.id)

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
                    this.deleteUserFromSearchingSongArray(event.author.id)
                    message.delete();
                    collectedMessage.delete();
                    return;
                };

                // si ningun caso anterior
                this.updateToPlayList(collectedMessage, event, response);
                this.deleteUserFromSearchingSongArray(event.author.id)
                message.delete();
                collectedMessage.delete();
            })
            .catch(() => {
                // sino contesta
                console.log(`No answer`);
                this.deleteUserFromSearchingSongArray(event.author.id)
                message.delete();
                event.reply('Time out')
                return;
            })
        // TODO: si contesta correctamente, siguiente busqueda

    }

    private deleteUserFromSearchingSongArray(userId: string) {
        // crea un nuevo array sin la id del usuario
        this.usersSearchingASong = this.usersSearchingASong.filter((id: string) => id !== userId)
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

    private async updateToPlayList(collectedMessage, event, response) {
        // numero marcado -1
        const numberSelected = Number((collectedMessage.content) - 1)

        const songId = response.data.items[numberSelected].id.videoId;

        // llamada api para duracion del vidio
        const songData = await this.youtubeSearch.searchSongById(songId);
        const songDurationString = songData.data.items[0].contentDetails.duration;

        const newSong: newSongRepository = {
            songName: response.data.items[numberSelected].snippet.title,
            songId: songId,
            duration: this.parseSongDuration(songDurationString),
            channel: event.channel,
            user: event.author
        }

        this.playListHandler.update(newSong);
    }

    private parseSongDuration(durationString = "") {
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
