import { DiscordRequestRepo } from "../../../domain/interfaces/discordRequestRepo";
import { PlayCommandSchema } from "../../../domain/commandSchema/playCommandSchema";
import { Command } from "../../../aplication/Command";
import { YoutubeSearch } from "../../../infrastructure/youtube.ts/youtubeHandler";
import { MessageEmbed } from 'discord.js';
import { CommandOutput } from "../../../domain/interfaces/commandOutput";
import { discordEmojis } from "../../../domain/discordEmojis";
import { playListRepository } from "../../../domain/interfaces/playListRepository";
import { PlayListHandler } from "../../playListHandler"
import { CoolDown } from "../../utils/coolDown";


export class PlayCommand extends Command {
    playSchema: DiscordRequestRepo = PlayCommandSchema;
    coolDown = new CoolDown();
    youtubeSearch: YoutubeSearch;
    playListHandler: PlayListHandler;

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
        if (event.content.length < 3) {
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

        // enviar respuesta con opciones
        const message = await event.reply(output)

        // const message = await event.channel.send(output)

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
                    event.channel.send('Search cancelled');
                    message.delete();
                    collectedMessage.delete();
                    return;
                };

                // si no hay respuesta se borra el mensaje
                if (!collectedMessage) {
                    console.log(`No answer`);
                    message.delete();
                    event.channel.send('Time out')
                    return;
                }

                // si ningun caso anterior
                this.updateToPlayList(collectedMessage, event, response);
                message.delete();
                collectedMessage.delete();
            })
            .catch((err) => {
                // si hay un error, se borra el mensaje
                console.log(`Error: ${err}`);
                message.delete();
                event.channel.send(`Error: ${err}`)
                return;
            })
        // TODO: si contesta correctamente, siguiente busqueda

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

    private updateToPlayList(collectedMessage, event, response) {
        // numero marcado -1
        const numberSelected = Number((collectedMessage.content) - 1)

        const newSong: playListRepository = {
            songName: response.data.items[numberSelected].snippet.title,
            songId: response.data.items[numberSelected].id.videoId,
            channel: event.channel,
            user: event.author
        }

        this.playListHandler.update(newSong);
    }
}
