import { Message } from 'discord.js';
import { Command } from '../../../domain/interfaces/Command';
import { CommandSchema } from '../../../domain/interfaces/commandSchema';
import { PlayListHandler } from '../../playListHandler';
import { PaginatedMessage } from '../../utils/paginatedMessage';
import { UsersUsingACommand } from '../../utils/usersUsingACommand';

export class PlayNowCommand extends Command {
    constructor(
        private playNowSchema: CommandSchema,
        private playListHandler: PlayListHandler,
        private usersUsingACommand: UsersUsingACommand,
    ) {
        super();
    }

    public async call(event: Message, adminRole: string): Promise<void> {
        if (this.roleAndCooldownValidation(event, this.playNowSchema, adminRole)) {
            return;
        }

        const playList: string[] = this.playListHandler.readPlayList();

        if (!playList[0]) {
            event.reply('There is no playList');
            return;
        }

        await new PaginatedMessage({
            embed: {
                color: '#fff9c4',
                title: 'Play now the song:',
                author: {
                    name: `${event.member!.user.username}`,
                    iconURL: `${event.member!.user.displayAvatarURL()}`,
                },
                description: `Write the **number** of the song you wish to listen. \nWrite **X** to cancel operation`,
            },
            pagination: {
                channel: event.channel,
                dataToPaginate: [...playList],
                dataPerPage: 10,
                timeOut: 60000,
                jsFormat: true,
                deleteWhenTimeOut: false,
                reply: false,
                closeButton: false,
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
            const chosenNumber = message.content;
            const numbersConditions =
                !isNaN(Number(chosenNumber)) &&
                Number(chosenNumber) <= lastSongIndex &&
                Number(chosenNumber) >= 1;

            const letterConditoin = message.content === 'x' || message.content === 'X';

            // si la respuesta viene del mismo que el evento, todos son numeros, mayot que 0 y no mayor que el numero de items, o X
            return userConditions && (numbersConditions || letterConditoin);
        };

        event.channel
            .awaitMessages({ filter, time: 60000, max: 1, errors: ['time'] })
            .then((collected) => {
                // usuario ya puede usar otros comandos
                this.usersUsingACommand.removeUserList(event.author.id);
                const collectedMessage: Message<boolean>[] = collected.map((e: Message) => e);
                console.log('number: ', collectedMessage[0].content);
                if (collectedMessage[0].content === 'x' || collectedMessage[0].content === 'X') {
                    // cancela el comando
                    event.channel.send('Remove command cancelled');
                    return;
                }

                return this.putSongInFirstPlace(collectedMessage[0].content, event);
            })
            .catch((err) => {
                if (err instanceof TypeError) {
                    console.log('Play now colector error: ', err);
                    event.channel.send('Ha habido un error, por favor vuelvelo a intentar');
                } else {
                    event.reply('Time out');
                }

                this.usersUsingACommand.removeUserList(event.author.id);
                return;
            });
    }

    private putSongInFirstPlace(content: string, event: Message): void {
        // pasa a playListHandler el indice(-1) de las canciones
        const chosenMusic = Number(content);

        const song = this.playListHandler.putSongInFirstPoistionOfPlaylist(chosenMusic);
        if (song) {
            event.channel.send('Playing: ' + '```js\n' + song.songName + '\n```');
        }

        return;
    }
}
