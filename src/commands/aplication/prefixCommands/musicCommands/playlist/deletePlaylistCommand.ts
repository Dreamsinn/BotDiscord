import { Message } from 'discord.js';
import { ConnectionHandler } from '../../../../../database/connectionHandler';
import { Playlist } from '../../../../../database/playlist/domain/playlistEntity';
import { Command } from '../../../../domain/interfaces/Command';
import { CommandSchema } from '../../../../domain/interfaces/commandSchema';
import { PaginatedMessage } from '../../../utils/paginatedMessage';
import { UsersUsingACommand } from '../../../utils/usersUsingACommand';

export class DeletePlaylistCommand extends Command {
    private privatePlaylist: boolean;

    constructor(
        private databaseConnection: ConnectionHandler,
        private usersUsingACommand: UsersUsingACommand,
    ) {
        super();
    }

    public async call(event: Message, adminRole: string, deletePlSchema: CommandSchema): Promise<void> {
        if (this.roleAndCooldownValidation(event, deletePlSchema, adminRole)) {
            return;
        }

        // reset privatePlaylist
        this.privatePlaylist = true;

        // if command was runed with guild, is mandatory admin role
        if (event.content.includes('guild')) {
            if (!this.checkAdminRole.call(event, adminRole)) {
                event.channel.send('Para esta accion es obligatorio el rol de admin');
                return;
            }
            this.privatePlaylist = false;
        }

        this.usersUsingACommand.updateUserList(event.author.id);

        await this.createMessageCollector(event);
    }

    private async createMessageCollector(event: Message) {
        const author = this.privatePlaylist ? event.author.id : event.guild!.id;

        const playListArray = await this.databaseConnection.playlist.getByAuthor(author);

        // if there are no playlist
        if (!playListArray.length) {
            this.usersUsingACommand.removeUserList(event.author.id);
            if (this.privatePlaylist) {
                return event.reply('No dispones de ninguna playlist.');
            } else {
                return event.reply('El servidor no dispone de ninguna playlist.');
            }
        }

        const playListArrayString = await this.mapPlaylistArray(playListArray);

        const paginatedPlaylistArrayMessage = await this.createPaginatedPlaylistArrayMessage(
            event,
            playListArrayString,
        );

        const filter = (reaction: Message): boolean => {
            const userCondition = reaction.author.id === event.author.id;
            // number condition = write a number equal to the index of the role wanted
            const numberCondition =
                Number(reaction.content) <= playListArray.length && Number(reaction.content) > 0;
            const letterCondition = ['x', 'X'].includes(reaction.content);

            return userCondition && (numberCondition || letterCondition);
        };

        return event.channel
            .awaitMessages({ filter, time: 60000, max: 1, errors: ['time'] })
            .then(async (collected) => {
                const collectedMessage = collected.map((e: Message) => e);

                // delete response message
                await collectedMessage[0].delete();
                this.usersUsingACommand.removeUserList(event.author.id);

                await paginatedPlaylistArrayMessage
                    .delete()
                    .catch((err) => console.log('Error deleting paginatedPlaylistArrayMessage:', err));

                if (['x', 'X'].includes(collectedMessage[0].content)) {
                    return;
                }

                const playlistSelected = playListArray[Number(collectedMessage[0].content) - 1];

                try {
                    const deletedPl = await this.databaseConnection.playlist.delete(playlistSelected.id);

                    if (deletedPl instanceof Playlist) {
                        await event.channel.send(
                            `Playlist: '${deletedPl.name}' ha sido borrada correctamente.`,
                        );
                        return;
                    }

                    await event.channel.send(`No se ha podido borrar la playlist`);
                    return;
                } catch (err) {
                    await event.reply('Ha habido un error al intentar borrar la playlist');
                    return;
                }
            })
            .catch(async (err) => {
                this.usersUsingACommand.removeUserList(event.author.id);

                if (err instanceof Error) {
                    console.log('Error in changeAdminRole collector: ', err);
                    await event.reply('Ha habido un error al intentar borrar la playlist');
                    return;
                }

                await event.reply('Time out');

                return;
            });
    }

    private async createPaginatedPlaylistArrayMessage(
        event: Message,
        playListArray: string[],
    ): Promise<Message<boolean>> {
        const userName = event.member?.nickname ?? event.author.username;

        return new PaginatedMessage({
            embed: {
                color: '#FFE4C4',
                title: `Playlist de: ${this.privatePlaylist ? userName : event.guild?.name}`,
                author: {
                    name: `${userName}`,
                    iconURL: `${event.member!.user.displayAvatarURL()}`,
                },
                description:
                    'Escriba:\n' +
                    '- El **numero** de la playlist que quiera ver \n' +
                    '- **x** para cancelar',
            },
            pagination: {
                channel: event.channel,
                dataToPaginate: [...playListArray],
                dataPerPage: 9,
                timeOut: 60000,
                jsFormat: true,
                deleteWhenTimeOut: false,
                reply: false,
                closeButton: false,
                author: event.author,
            },
        }).call();
    }

    private async mapPlaylistArray(playListArray: Playlist[]): Promise<string[]> {
        // numerated array of playlist created by this author
        const playListArrayString: string[] = playListArray.map((playList: Playlist, i: number) => {
            const songArray = playList.songsId.split(',');

            return `${i + 1} - ${playList.name} 'Nº canciones:' ${songArray.length}\n`;
        });

        return playListArrayString;
    }
}
