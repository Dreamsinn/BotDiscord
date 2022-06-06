import { DiscordRequestRepo } from "../../../domain/interfaces/discordRequestRepo";
import { PlayCommandSchema } from "../../../domain/commandSchema/playCommandSchema";
import { Command } from "../../../aplication/Command";
import { YoutubeAPIHandler } from "../../../infrastructure/youtubeHandler";
import { PlayDlHandler } from "../../../infrastructure/playDlHandler"
import { MessageEmbed } from 'discord.js';
import { CommandOutput } from "../../../domain/interfaces/commandOutput";
import { discordEmojis } from "../../../domain/discordEmojis";
import { newSongRepository, playListRepository } from "../../../domain/interfaces/playListRepository";
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

    public call(event) {
        // si el mensaje no es mas largo que "~p " no tiene contenido
        if (event.content.length < 3) {
            return;
        }

        // si no estas en un canal de voz
        if (!event.member.voice.channel) {
            event.channel.send('Tienes que estar en un canal de voz!')
            return;
        }

        //comprobar coolDown
        const interrupt = this.coolDown.call(this.playSchema.coolDown);
        if (interrupt === 1) {
            console.log('command interrupted by cooldown')
            return;
        }

        const argument = event.content.substring(3)

        // si es una lista de youtube
        if (argument.includes('youtube.com/playlist?list=')) {
            return this.findYoutubePlayList(argument, event)
        }
        // es lista, y se esta reproduciendo una cancion
        if ((argument.includes('youtube.com') && argument.includes('&list='))) {
            return this.findYoutubePlayList(argument, event, true)
        }

        // si buscas por enlace de youtube
        if (argument.includes('youtube.com/watch?v=')) {
            return this.findSongIdFromYoutubeURL(argument, event)
        }

        // si buscas por nombre de cancion    
        return this.searchBySongName(argument, event);

    }

    private async searchBySongName(argument: string, event) {
        let response: SearchedSongRepository[];
        // llamamos primero a Play-Dl y si falla a Youtube API, para ahorrar gasto de la key
        try {
            response = await this.playDlHandler.searchSongByName(argument)
        } catch (err) {
            console.log(`Play-dl Search Error: ${err}`)
            event.channel.send(`Play-dl Search Error: ${err}`)

            try {
                response = await this.youtubeAPIHandler.searchSongByName(argument, event);
            } catch (err) {
                console.log(err)
                event.channel.send(err)
                event.channel.send(`It has not been possible to get song's options`)
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

        // subimos al usuario a la lista para que no pueda usar otros comandos
        this.usersUsingACommand.updateUserList(event.author.id)

        const message = await event.reply(output)

        const filter = (reaction) => {
            const authorCondition = event.author.id === reaction.author.id;
            const letterCondition = reaction.content === 'x'
            const numberCondition = (Number(reaction.content) && Number(reaction.content) > 0 && Number(reaction.content) < numberChoices)
            // si el autor es el mismo, y el mensaje contiene X, 0 o un numero entre 0 y las numero de opciones
            return authorCondition && (letterCondition || numberCondition);
        };

        message.channel.awaitMessages({ filter, time: 20000, max: 1, errors: ['time'] })
            .then((collected: any) => {
                // eliminamos a la persona de la lista de no poder usar comandos
                this.usersUsingACommand.removeUserList(event.author.id)
                let collectedMessage: any;
                collected.map((e: any) => collectedMessage = e);

                // Si se responde una X se borra el mensaje
                if (collectedMessage.content === 'x') {
                    console.log('Search cancelled');
                    event.reply('Search cancelled');
                    message.delete();
                    collectedMessage.delete();
                    return;
                };

                const numberSelected = Number((collectedMessage.content) - 1)

                const song: SearchedSongRepository = response[numberSelected];

                // eleminamos opciones
                message.delete();
                // eliminamos la respuesta a la opciones
                collectedMessage.delete();

                return this.updateToPlayList(event, song);
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
        // encontramos la id del video
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
        const songData: SearchedSongRepository = await this.mapSongData(event, song)

        const newSong: newSongRepository = {
            newSong: {
                songName: songData.title,
                songId: songData.id,
                duration: songData.durationData,
            },
            channel: event.channel,
            member: event.member
        }

        return this.playListHandler.update(newSong);
    }

    private async mapSongData(event, song: SearchedSongRepository): Promise<SearchedSongRepository> {
        // optenemos duracion y nombre
        // llama primero a Play-dl y si falla a Youtube API para no gastar el token
        try {
            const songData: YouTubeVideo = await this.playDlHandler.getSongInfo(song.id)
            if (!song.title) {
                song.title = songData.title;
            }
            song.durationData = this.parseSongDuration(String(songData.durationInSec), true)
        } catch (err) {
            event.channel.send(`Play-dl Data Error: ${err}`)
            console.log(`Play-dl Data Error: ${err}`)

            try {
                // si falla play-dl la llamamos a la api de google, para que sea mas dificil llegar al limite
                const songData = await this.youtubeAPIHandler.searchSongById(song.id);
                if (!song.title) {
                    song.title = songData.title;
                }
                song.durationData = this.parseSongDuration(songData.durationString, false)
            } catch (err) {
                event.channel.send(`It has not been possible to get song's information`)
                event.channel.send(`YoutubeAPI Error: ${err}`)
                console.log(`YoutubeAPI Error: ${err}`)
            }
        }
        return song
    }

    private async findYoutubePlayList(url: string, event, watch = false) {
        let rawPlayListId: string;
        let playListId: string;

        if (!watch) {
            // sino se esta rerpoduciendo un video
            playListId = url
                .replace('https://', '')
                .replace('www.', '')
                .replace('youtube.com/playlist?list=', '')

            if (playListId.length < 5) {
                event.reply('Bad request')
            }

            // llamamos primero a Play-dl porue ya da la informacion del video y no hara falta hacer una busqueda por cada video de la playlist
            try {
                const playListData: SearchedSongRepository[] = await this.playDlHandler.getSognsInfoFromPlayList(url)
                return this.mapPlayDLPlayListData(event, playListData)
            } catch (err) {
                event.channel.send('Play-dl failed to fectch PlayList, it will be tried with Youtube API')
                return this.fetchYoutubePlayListData(event, playListId, url)
            }
        }
        // si esta reproduciendo un video
        const playListIdPosition = url.search('&list=')
        rawPlayListId = url.substring(playListIdPosition + 6)

        if (rawPlayListId.includes('&')) {
            const nextParameterPosition = rawPlayListId.search('&')
            playListId = rawPlayListId.substring(0, nextParameterPosition)
        } else {
            playListId = rawPlayListId
        }

        if (playListId.length < 5) {
            event.reply('Bad request')
        }

        return this.isPlayListDesired(event, playListId, url)
    }

    private async isPlayListDesired(event, playListId: string, url: string) {
        // preguntamos al usuario si quiere reproducir la cancion el la playlist
        const embed = this.createIsPlayListDesiredEmbed()

        const output: CommandOutput = {
            embeds: [embed],
        }

        const message = await event.channel.send(output)

        this.usersUsingACommand.updateUserList(event.author.id)

        const filter = (reaction) => {
            const authorCondition = event.author.id === reaction.author.id;
            const contentCondition = ['y', 'Y', 'n', 'N', 'x', 'X'].includes(reaction.content)
            // si el autor es el mismo, y el mensaje contiene Y, N, o X
            return authorCondition && contentCondition;
        };

        message.channel.awaitMessages({ filter, time: 20000, max: 1, errors: ['time'] })
            .then(async (collected: any) => {
                this.usersUsingACommand.removeUserList(event.author.id)
                let collectedMessage: any;
                collected.map((e: any) => collectedMessage = e);

                // Si se responde una X se borra el mensaje
                if (['x', 'X'].includes(collectedMessage.content)) {
                    console.log('Search cancelled');
                    event.reply('Search cancelled');

                    message.delete();
                    return;
                };

                // N que toque la cancion del enlace
                if (['n', 'N'].includes(collectedMessage.content)) {
                    message.delete();
                    return this.findSongIdFromYoutubeURL(url, event)
                };

                // play playList
                if (['y', 'Y'].includes(collectedMessage.content)) {
                    message.delete();
                    try {
                        const playListData: SearchedSongRepository[] = await this.playDlHandler.getSognsInfoFromPlayList(url)

                        return this.mapPlayDLPlayListData(event, playListData)
                    } catch (err) {
                        event.channel.send('Play-dl failed to fectch PlayList, it will be tried with Youtube API')
                    }
                    return this.fetchYoutubePlayListData(event, playListId, url)
                };
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

    private createIsPlayListDesiredEmbed() {
        const embed = new MessageEmbed()
            .setColor('#0099ff')
            .setTitle('Is playlist desired?')
            .setDescription('Y - Play playlisy \nN - Play song \nX - Cancel')

        // devuelve el embed y el numero de eleciones 
        return embed;
    }

    private mapPlayDLPlayListData(event, rawPlayList: SearchedSongRepository[]) {
        const playList: playListRepository[] = [];
        rawPlayList.forEach((song: SearchedSongRepository) => {
            const newSong: playListRepository = {
                songName: song.title,
                songId: song.id,
                duration: this.parseSongDuration(String(song.duration), true)
            }
            playList.push(newSong)
        })
        return this.updatePlayListWithAPlayList(event, playList)
    }

    private async fetchYoutubePlayListData(event, playListId: string, url: string) {
        // llama a la API de youtube, si esta tambien falla y esta sonando un video reproduce el video
        let rawPlayList: SearchedSongRepository[];
        try {
            rawPlayList = await this.youtubeAPIHandler.searchPlaylist(playListId)
        } catch (err) {
            event.channel.send(`YoutubeAPI Error: ${err}`)
            console.log(`YoutubeAPI Error: ${err}`)
            event.channel.send(`It has not been possible to get playList`)
            if (url.includes('watch?v=')) {
                event.channel.send(`Instead, song will be played`)
                return this.findSongIdFromYoutubeURL(url, event)
            }
            return
        }
        // por cada video llama a la api para obtener la informacion
        const playlist: playListRepository[] = await this.mapSongListData(event, rawPlayList)

        return this.updatePlayListWithAPlayList(event, playlist)
    }


    private async mapSongListData(event, rawPlayList: SearchedSongRepository[]): Promise<playListRepository[]> {
        const playlist: playListRepository[] = []
        for (let i = 0; rawPlayList.length > i; i++) {
            const songData = await this.mapSongData(event, rawPlayList[i])
            const newSong: playListRepository = {
                songName: songData.title,
                songId: songData.id,
                duration: songData.durationData,
            }
            playlist.push(newSong)
        }
        return playlist
    }

    private async updatePlayListWithAPlayList(event, playList?: playListRepository[]) {
        const newSongList: newSongRepository = {
            songList: playList,
            channel: event.channel,
            member: event.member
        }

        return this.playListHandler.update(newSongList);
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
