import { Message } from 'discord.js';
import { discordEmojis } from '../../../../domain/discordEmojis';
import { APIResponse } from '../../../../domain/interfaces/APIResponse';
import { PlayCommand } from '../../../../domain/interfaces/playCommand';
import { RawSong, Song } from '../../../../domain/interfaces/song';
import { PlayDlHandler } from '../../../../infrastructure/playDlHandler';
import { YoutubeAPIHandler } from '../../../../infrastructure/youtubeHandler';
import { MessageCreator } from '../../../utils/messageCreator';
import { UsersUsingACommand } from '../../../utils/usersUsingACommand';

export class PlayMusicByName extends PlayCommand {
    private usersUsingACommand: UsersUsingACommand;

    constructor(
        musicAPIs: {
            youtubeAPI: YoutubeAPIHandler;
            playDlAPI: PlayDlHandler;
        },
        usersUsingACommand: UsersUsingACommand,
    ) {
        super(musicAPIs);
        this.usersUsingACommand = usersUsingACommand;
    }

    async call(event: Message, argument: string): Promise<Song | void> {
        let unchosenMusic: RawSong[];
        // llamamos primero a Play-Dl y si falla a Youtube API, para ahorrar gasto de la key

        const playDlResponse: APIResponse<RawSong[]> = await this.playDlHandler.searchSongByName(
            argument,
        );

        if (playDlResponse.isError) {
            console.log(`Play-dl Search by name Error: ${playDlResponse.errorData}`);

            const youtubeResponse = await this.youtubeAPIHandler.searchSongByName(argument);

            if (youtubeResponse.isError) {
                console.log('Youtube Search by name Error:', youtubeResponse.errorData);
                event.channel.send(`It has not been possible to get song's data`);
                return;
            }

            unchosenMusic = youtubeResponse.data;
        } else {
            unchosenMusic = playDlResponse.data;
        }

        if (!unchosenMusic[0]) {
            event.channel.send('No hay coincidencias');
            return;
        }

        return await this.listenUserChoices(event, unchosenMusic)
    }

    private async listenUserChoices(event: Message, unchosenMusic: RawSong[]) {
        const { output, numberChoices } = this.createSelectChoicesEmbed(unchosenMusic);

        // subimos al usuario a la lista para que no pueda usar otros comandos
        this.usersUsingACommand.updateUserList(event.author.id);

        const message = await event.reply(output);

        const filter = (reaction: Message) => {
            const authorCondition = event.author.id === reaction.author.id;
            const letterCondition = reaction.content === 'x';
            const numberCondition =
                Number(reaction.content) &&
                Number(reaction.content) > 0 &&
                Number(reaction.content) < numberChoices;
            // si el autor es el mismo, y el mensaje contiene X, 0 o un numero entre 0 y las numero de opciones
            return authorCondition && (letterCondition || numberCondition);
        };

        try {
            const collected = await message.channel.awaitMessages({
                filter,
                time: 20000,
                max: 1,
                errors: ['time'],
            });

            this.usersUsingACommand.removeUserList(event.author.id);
            let collectedMessage: Message;
            collected.map((e: Message) => (collectedMessage = e));

            // Si se responde una X se borra el mensaje
            if (collectedMessage.content === 'x') {
                console.log('Search cancelled');
                event.reply('Search cancelled');
                message.delete();
                collectedMessage.delete();
                return;
            }

            const numberSelected = Number(collectedMessage.content) - 1;

            // eleminamos opciones
            message.delete();
            // eliminamos la respuesta a la opciones
            collectedMessage.delete();

            const songId = unchosenMusic[numberSelected].songId;

            if (songId) {
                return this.mapSongData(event, songId);
            }
            return;
        } catch (err) {
            if (err instanceof TypeError) {
                console.log('Select music colector error: ', err);
                event.channel.send(`Error: ${err.message}`);
            } else {
                // sino contesta
                console.log(`No answer`);
                event.reply('Time out');
            }

            this.usersUsingACommand.removeUserList(event.author.id);
            message.delete();
            return;
        }
    }

    private createSelectChoicesEmbed(unchosenMusic: RawSong[]) {
        // pasa un embed al discord para que elija exactamente cual quiere
        let embedContent = '```js\n';

        unchosenMusic.forEach((song, i) => {
            embedContent += `${i + 1} - ${song.songName}\n`;
        });

        embedContent += `${discordEmojis.x} - Cancel\n` + '```';

        const output = new MessageCreator({
            embed: {
                color: '#40b3ff',
                field: {
                    name: 'Escriba el número de la canción que quiera seleccionar',
                    value: embedContent,
                    inline: false,
                },
            },
        }).call();

        // devuelve el embed y el numero de eleciones
        return { output, numberChoices: unchosenMusic.length };
    }
}
