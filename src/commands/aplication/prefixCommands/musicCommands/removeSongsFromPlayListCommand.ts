import { Message } from 'discord.js';
import { RemoveSongsFromPlayListCommandSchema } from '../../../domain/commandSchema/removeSongsFromPlayListCommandSchema';
import { Command } from '../../../domain/interfaces/Command';
import { CommandSchema } from '../../../domain/interfaces/commandSchema';
import { SongData } from '../../../domain/interfaces/songData';
import { PlayListHandler } from '../../playListHandler';
import { CoolDown } from '../../utils/coolDown';
import { PaginatedMessage } from '../../utils/paginatedMessage';
import { UsersUsingACommand } from '../../utils/usersUsingACommand';

export class RemoveSongsFromPlayListCommand extends Command {
    private removeSchema: CommandSchema = RemoveSongsFromPlayListCommandSchema;
    private coolDown = new CoolDown();
    private playListHandler: PlayListHandler;
    private usersUsingACommand = UsersUsingACommand.usersUsingACommand;

    constructor(playListHandler: PlayListHandler) {
        super();
        this.playListHandler = playListHandler;
    }

    public async call(event: Message) {
        //comprobar coolDown
        const interrupt = this.coolDown.call(this.removeSchema.coolDown);
        if (interrupt === 1) {
            console.log('command interrupted by cooldown');
            return;
        }

        const playList: SongData[] = this.playListHandler.readPlayList();

        await new PaginatedMessage({
            embed: {
                color: 'ORANGE',
                title: 'Remove songs from playlist:',
                author: {
                    name: `${event.member.user.username}`,
                    iconURL: `${event.member.user.displayAvatarURL()}`,
                },
                description:
                    'Write the numbers of the songs you wish to remove split by " , " \nWrite " X " to cancel operation',
            },
            pagination: {
                event: event,
                rawDataToPaginate: playList,
                dataPerPage: 10,
                timeOut: 60000,
                jsFormat: true,
                reply: false,
                author: event.author,
            },
        }).call();

        return this.messageCollector(event, playList);
    }

    private messageCollector(event: Message, playList: SongData[]) {
        // usuario no pueda ejecutar otros comandos
        this.usersUsingACommand.updateUserList(event.author.id);

        const lastSongIndex = playList.length;

        const filter = (message: Message) => {
            const userConditions = event.author.id === message.author.id;
            const numbersArray = message.content.split(',');
            const numbersConditions =
                !numbersArray.find((n) => isNaN(Number(n))) &&
                Math.max(Number(...numbersArray)) <= lastSongIndex &&
                Math.min(Number(...numbersArray)) >= 1;
            const letterConditoin = message.content === 'x' || message.content === 'X';

            // si la respuesta viene del mismo que el evento, todos son numeros, mayot que 0 y no mayor que el numero de items, o X
            return userConditions && (numbersConditions || letterConditoin);
        };

        event.channel
            .awaitMessages({ filter, time: 60000, max: 1, errors: ['time'] })
            .then((collected) => {
                // usuario ya puede usar otros comandos
                this.usersUsingACommand.removeUserList(event.author.id);
                let collectedMessage: Message;
                collected.map((e: Message) => (collectedMessage = e));

                if (collectedMessage.content === 'x' || collectedMessage.content === 'X') {
                    // cancela el comando
                    console.log('Remove command cancelled');
                    event.channel.send('Remove command cancelled');
                    return;
                }

                return this.removeSongFromPlayList(collectedMessage.content, event);
            })
            .catch((err) => {
                if (err instanceof TypeError) {
                    console.log(err);
                    event.channel.send(`Error: ${err.message}`);
                } else {
                    event.reply('Time out');
                }

                this.usersUsingACommand.removeUserList(event.author.id);
                return;
            });
    }

    private removeSongFromPlayList(content: string, event: Message) {
        // pasa a playListHandler el indice(-1) de las canciones
        const stringNumbersArray = content.split(',');

        const numberArray: number[] = [];

        stringNumbersArray.forEach((str) => {
            const n = Number(str);
            if (n !== 0) {
                numberArray.push(Number(str));
            }
        });

        // recive las canciones borradas y hace embed de las canciones borradas
        const removedMusic = this.playListHandler.removeSongsFromPlayList(numberArray);
        return this.removedMusicEmbed(removedMusic, event);
    }

    private async removedMusicEmbed(removedMusic: SongData[], event: Message) {
        return await new PaginatedMessage({
            embed: {
                color: 'ORANGE',
                title: `${removedMusic.length} songs removeds from Playlist`,
                author: {
                    name: `${event.member.user.username}`,
                    iconURL: `${event.member.user.displayAvatarURL()}`,
                },
            },
            pagination: {
                event: event,
                rawDataToPaginate: removedMusic,
                dataPerPage: 10,
                timeOut: 30000,
                reply: false,
                jsFormat: true,
            },
        }).call();
    }
}
