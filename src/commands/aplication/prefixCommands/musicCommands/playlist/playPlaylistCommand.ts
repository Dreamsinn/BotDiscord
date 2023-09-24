import { Message } from 'discord.js';
import { ConnectionHandler } from '../../../../../database/connectionHandler';
import { PlaylistDTO } from '../../../../../database/playlist/domain/playlistDTO';
import { SongDTO } from '../../../../../database/song/domain/SongDTO';
import { Command, CommandProps } from '../../../../domain/interfaces/Command';
import { CommandSchema } from '../../../../domain/interfaces/commandSchema';
import { SongData, SongsToPlaylist } from '../../../../domain/interfaces/song';
import { PlayListHandler } from '../../../playListHandler';
import { PaginatedMessage } from '../../../utils/paginatedMessage';
import { UsersUsingACommand } from '../../../utils/usersUsingACommand';

export class PlayPlaylistCommand extends Command {
    private privatePlaylist: boolean;
    private usersUsingACommand: UsersUsingACommand;

    constructor(
        private playListHandler: PlayListHandler,
        private databaseConnection: ConnectionHandler,
    ) {
        super();
    }

    public async call(
        event: Message,
        adminRole: string,
        playPlSchema: CommandSchema,
        { usersUsingACommand }: CommandProps,
    ): Promise<void> {
        if (this.roleAndCooldownValidation(event, playPlSchema, adminRole)) {
            return;
        }

        this.usersUsingACommand = usersUsingACommand!;

        // reset parameters
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

        const selectPlaylistToPlayMessage = await this.selectPlaylistToPlayMessage(
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

                if (['x', 'X'].includes(collectedMessage[0].content)) {
                    return;
                }

                await selectPlaylistToPlayMessage
                    .delete()
                    .catch((err) => console.log('Error deleting selectPlaylistToPlayMessage:', err));

                const playlistSelected = playListArray[Number(collectedMessage[0].content) - 1];

                return this.playPlaylist(event, playlistSelected);
            })
            .catch(async (err) => {
                this.usersUsingACommand.removeUserList(event.author.id);

                if (err instanceof Error) {
                    console.log('Error in play playlists collector: ', err);
                    return err;
                }

                await event.reply('Time out');

                return;
            });
    }

    private async mapPlaylistArray(playListArray: PlaylistDTO[]): Promise<string[]> {
        // numerated array of playlists created by this author
        const playListArrayString: string[] = playListArray.map((playList: PlaylistDTO, i: number) => {
            return `${i + 1} - ${playList.name} 'Nº canciones:' ${
                playList.songsId.length ? playList.songsId.length : 0
            }\n`;
        });

        return playListArrayString;
    }

    private async selectPlaylistToPlayMessage(
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
                    '- El **numero** de la playlist que quiera escuchar \n' +
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

    private async playPlaylist(event: Message, playList: PlaylistDTO): Promise<void> {
        const songsArray = await this.databaseConnection.song.getById(playList.songsId);

        const songDataArray: SongData[] = songsArray.map((song: SongDTO) => {
            const songData: SongData = {
                songName: song.name,
                songId: song.id,
                duration: {
                    hours: song.duration.hours,
                    minutes: song.duration.minutes,
                    seconds: song.duration.seconds,
                    string: song.duration.string,
                },
                thumbnails: song.thumbnail,
            };

            return songData;
        });

        if (event.member) {
            const newSongList: SongsToPlaylist = {
                newSongs: songDataArray,
                channel: event.channel,
                member: event.member,
            };

            this.playListHandler.update(newSongList);
        }
    }
}
