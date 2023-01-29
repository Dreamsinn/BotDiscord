import { Message } from 'discord.js';
import { RemoveSongsFromPlayListCommandSchema } from '../../../domain/commandSchema/removeSongsFromPlayListCommandSchema';
import { Command } from '../../../domain/interfaces/Command';
import { CommandSchema } from '../../../domain/interfaces/commandSchema';
import { PlayListHandler } from '../../playListHandler';
import { PaginatedMessage } from '../../utils/paginatedMessage';
import { UsersUsingACommand } from '../../utils/usersUsingACommand';

export class RemoveSongsFromPlayListCommand extends Command {
    private removeSchema: CommandSchema = RemoveSongsFromPlayListCommandSchema;

    constructor(
        private playListHandler: PlayListHandler,
        private usersUsingACommand: UsersUsingACommand,
    ) {
        super();
    }

    public async call(event: Message): Promise<void> {
        if (this.roleAndCooldownValidation(event, this.removeSchema)) {
            return;
        }

        const playList: string[] = this.playListHandler.readPlayList();

        if (!playList[0]) {
            event.reply('There is no playList');
            return;
        }

        await new PaginatedMessage({
            embed: {
                color: 'ORANGE',
                title: 'Remove songs from playlist:',
                author: {
                    name: `${event.member.user.username}`,
                    iconURL: `${event.member.user.displayAvatarURL()}`,
                },
                description: `Write the **numbers** of the songs you wish to remove split by " , " \nWrite **X** to cancel operation`,
            },
            pagination: {
                channel: event.channel,
                dataToPaginate: playList,
                dataPerPage: 10,
                timeOut: 60000,
                jsFormat: true,
                reply: false,
                author: event.author,
            },
        }).call();

        this.messageCollector(event, playList);
    }

    private messageCollector(event: Message, playList: string[]): void {
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
                    event.channel.send('Remove command cancelled');
                    return;
                }

                return this.removeSongFromPlayList(collectedMessage.content, event);
            })
            .catch((err) => {
                if (err instanceof TypeError) {
                    console.log('Remove Song colector error: ', err);
                    event.channel.send('Ha habido un error, por favor vuelvelo a intentar');
                } else {
                    event.reply('Time out');
                }

                this.usersUsingACommand.removeUserList(event.author.id);
                return;
            });
    }

    private removeSongFromPlayList(content: string, event: Message): void {
        // pasa a playListHandler el indice(-1) de las canciones
        const stringNumbersArray = content.split(',');

        const numberArray = stringNumbersArray.map((str) => {
            const n = Number(str);
            if (n !== 0) {
                return Number(str);
            }
        });

        // recive las canciones borradas y hace embed de las canciones borradas
        const removedMusic = this.playListHandler.removeSongsFromPlayList(numberArray);
        this.removedMusicEmbed(removedMusic, event);
    }

    private async removedMusicEmbed(removedMusic: string[], event: Message): Promise<void> {
        await new PaginatedMessage({
            embed: {
                color: 'ORANGE',
                title: `${removedMusic.length} songs removeds from Playlist`,
                author: {
                    name: `${event.member?.user.username}`,
                    iconURL: `${event.member?.user.displayAvatarURL()}`,
                },
            },
            pagination: {
                channel: event.channel,
                dataToPaginate: removedMusic,
                dataPerPage: 10,
                timeOut: 30000,
                reply: false,
                jsFormat: true,
            },
        }).call();
        return;
    }
}
