import { Message } from 'discord.js';
import { ConnectionHandler } from '../../../../../database/connectionHandler';
import { PlaylistDTO } from '../../../../../database/playlist/domain/playlistDTO';
import { ErrorEnum } from '../../../../../database/shared/domain/enums/ErrorEnum';
import { SongDTO } from '../../../../../database/song/domain/SongDTO';
import { discordEmojis } from '../../../../domain/discordEmojis';
import { ButtonsStyleEnum } from '../../../../domain/enums/buttonStyleEnum';
import { UpdatePlaylistButtonsEnum } from '../../../../domain/enums/updatePlaylistButtonsEnum';
import { Command } from '../../../../domain/interfaces/Command';
import { CommandSchema } from '../../../../domain/interfaces/commandSchema';
import { SongData } from '../../../../domain/interfaces/song';
import { PlayListHandler } from '../../../playListHandler';
import { FindMusicByName } from '../../../utils/findMusic/findMusicByName';
import { FindMusicBySpotifySongURL } from '../../../utils/findMusic/findMusicBySpotifySongURL';
import { FindMusicByYouTubeMobileURL } from '../../../utils/findMusic/findMusicByYouTubeMobileURL';
import { FindMusicByYouTubeURL } from '../../../utils/findMusic/findMusicByYouTubeURL';
import { FindPlaylistBySpotifyURL } from '../../../utils/findMusic/findPlaylistBySpotifyURL';
import { FindPlayListByYoutubeURL } from '../../../utils/findMusic/findPlayListByYoutubeURL';
import { MessageCreator } from '../../../utils/messageCreator';
import messageToEditMissage from '../../../utils/messageToEditMissage';
import { PaginatedMessage } from '../../../utils/paginatedMessage';
import { UsersUsingACommand } from '../../../utils/usersUsingACommand';
import { AddSongsToPlaylist } from './utils/addSongToPlaylist';
import { ChangePlaylistName } from './utils/changePlaylistName';
import { RemoveSongsFromPlayList } from './utils/removeSongsFromPlaylist';

type SongDictionary = Map<string, SongData>;

export class UpdatePlaylistCommand extends Command {
    private privatePlaylist: boolean;

    private playlistData: PlaylistDTO;

    private newPlaylistName: string;

    private playlistSongs: {
        current: SongDictionary;
        toUpdate: {
            added: SongDictionary;
            removed: SongDictionary;
        };
    };
    // a song in 'added' cant be in 'current'
    // a song to be added into 'removed' first must be in 'current' or 'added'
    // when a song is added into 'added', will be removed from 'removed' if posible
    // when a song is added into 'removed', will be removed from 'added' if posible
    // 'added' and 'removed' cant have duplicated songs

    private showSongs: 'playlist' | 'added' | 'removed';

    constructor(
        private playListHandler: PlayListHandler,
        private databaseConnection: ConnectionHandler,
        private usersUsingACommand: UsersUsingACommand,
        private findMusicByName: FindMusicByName,
        private findMusicByYouTubeMobileURL: FindMusicByYouTubeMobileURL,
        private findPlayListByYoutubeURL: FindPlayListByYoutubeURL,
        private findMusicByYouTubeURL: FindMusicByYouTubeURL,
        private findMusicBySpotifySongURL: FindMusicBySpotifySongURL,
        private findMusicBySpotifyPlaylistURL: FindPlaylistBySpotifyURL,
    ) {
        super();
    }

    public async call(event: Message, adminRole: string, deletePlSchema: CommandSchema): Promise<void> {
        if (this.roleAndCooldownValidation(event, deletePlSchema, adminRole)) {
            return;
        }

        // reset values
        this.privatePlaylist = true;
        this.playlistSongs = {
            current: new Map(),
            toUpdate: {
                added: new Map(),
                removed: new Map(),
            },
        };
        this.showSongs = 'playlist';
        this.newPlaylistName = '';

        // if command was runed with guild, is mandatory admin role
        if (event.content.includes('guild')) {
            if (!this.checkAdminRole.call(event, adminRole)) {
                event.channel.send('Para esta accion es obligatorio el rol de admin');
                return;
            }
            this.privatePlaylist = false;
        }

        this.usersUsingACommand.updateUserList(event.author.id);

        // message collection to select which playlist update
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

                const selectedPlaylist = playListArray[Number(collectedMessage[0].content) - 1];
                await this.setPlaylistData(selectedPlaylist, event);
            })
            .catch(async (err) => {
                this.usersUsingACommand.removeUserList(event.author.id);

                if (err instanceof Error) {
                    console.log('Error in updatePlaylistCollector collector: ', err);
                    await event.reply('Ha habido un error al seleccionar la playlist');
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
                    '- El **numero** de la playlist que quiera modificar \n' +
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

    private async mapPlaylistArray(playListArray: PlaylistDTO[]): Promise<string[]> {
        // numerated array of playlist created by this author
        const playListArrayString: string[] = playListArray.map((playList: PlaylistDTO, i: number) => {
            return `${i + 1} - ${playList.name} 'Nº canciones:' ${
                playList.songsId.length ? playList.songsId.length : 0
            }\n`;
        });

        return playListArrayString;
    }

    private async setPlaylistData(playlist: PlaylistDTO, event: Message) {
        // once chosen, set the class variables
        this.playlistData = playlist;

        const songList = await this.databaseConnection.song.getById(playlist.songsId);
        const songDataList = this.convetSongIntoSongData(songList);

        songDataList.forEach((song: SongData) => this.playlistSongs.current.set(song.songId, song));

        return await this.createPlaylistOptionsMessage(event);
    }

    private convetSongIntoSongData(songList: SongDTO[]): SongData[] {
        if (!songList.length) {
            return [];
        }

        const songDataList: SongData[] = songList.map((song: SongDTO) => {
            const songData: SongData = {
                songId: song.id,
                songName: song.name,
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

        return songDataList;
    }

    private async createPlaylistOptionsMessage(event: Message, playlistMessage: Message | null = null) {
        this.usersUsingACommand.updateUserList(event.author.id);

        const playlistOptionsEmbed = this.createPlaylistOptionsEmbed(event);

        let playlistOptionsMessage: Message<boolean> | void;
        if (playlistMessage) {
            // if is called with a message, edit it to update it
            playlistOptionsMessage = await playlistMessage
                .edit(messageToEditMissage(playlistOptionsEmbed))
                .catch(async () => {
                    await event.channel.send('Ha habido un error, se guardarán los cambios efectuados');
                });
        } else {
            // if first time this method is called, create the message
            playlistOptionsMessage = await event.channel.send(playlistOptionsEmbed);
        }

        // this.showSongs establish wich array will be seen: playlist, added or removed
        const songListToPaginate = this.mapSongsToPagination();

        // under the main message will be the list of songs in playlist
        const songsInPlaylistMessage = await this.createSongsInPlaylistMessage(
            event,
            songListToPaginate,
        );

        if (playlistOptionsMessage) {
            this.buttonCollector(event, playlistOptionsMessage, songsInPlaylistMessage);
        }
    }

    private createPlaylistOptionsEmbed(event: Message) {
        const userName = event.member?.nickname ?? event.author.username;

        return new MessageCreator({
            embed: {
                color: '#d817ff',
                title: 'Modificar Playlist',
                author: {
                    name: `${userName}`,
                    iconURL: `${event.member?.user.displayAvatarURL()}`,
                },
                description:
                    '**Solo** podrá interactuar la **persona** que haya **activado el comando**.\n' +
                    'Mientras este **comando** este **en uso no podrá usar otro comando**.\n\n' +
                    '**__ No se pueden tener 2 playlist con el mismo nombre por autor __**',
                fields: [
                    {
                        name: 'Actulamente: ',
                        value:
                            `> **Autor:** ${this.privatePlaylist ? userName : event.guild?.name}\n` +
                            `> **Nombre playlist:** ${this.playlistData.name}\n` +
                            `> **Nº canciones:** ${this.playlistSongs.current.size}`,
                        inline: false,
                    },
                    {
                        name: 'Cambios: ',
                        value:
                            `> **Nombre playlist:** ${this.newPlaylistName}\n` +
                            `> **Nº canciones:** \n` +
                            `> -  *Añadidas*: ${this.playlistSongs.toUpdate.added.size}\n` +
                            `> -  *Quitadas*: ${this.playlistSongs.toUpdate.removed.size}`,
                        inline: false,
                    },
                ],
            },
            buttons: [
                [
                    {
                        style: ButtonsStyleEnum.BLUE,
                        label: 'Change name',
                        custom_id: UpdatePlaylistButtonsEnum.NAME,
                    },
                    {
                        style: ButtonsStyleEnum.BLUE,
                        label: 'Add songs',
                        custom_id: UpdatePlaylistButtonsEnum.ADD,
                    },
                    {
                        style: ButtonsStyleEnum.BLUE,
                        label: 'Add playing songs',
                        custom_id: UpdatePlaylistButtonsEnum.ADDPLAYING,
                    },
                    {
                        style: ButtonsStyleEnum.BLUE,
                        label: 'Remove songs',
                        custom_id: UpdatePlaylistButtonsEnum.REMOVE,
                    },
                ],
                [
                    {
                        style: ButtonsStyleEnum.GREY,
                        label: 'Show playlist',
                        custom_id: UpdatePlaylistButtonsEnum.SHOWPL,
                    },
                    {
                        style: ButtonsStyleEnum.GREY,
                        label: 'Show added songs',
                        custom_id: UpdatePlaylistButtonsEnum.SHOWADDED,
                    },
                    {
                        style: ButtonsStyleEnum.GREY,
                        label: 'Show removed songs',
                        custom_id: UpdatePlaylistButtonsEnum.SHOWREMOVED,
                    },
                ],
                [
                    {
                        style: ButtonsStyleEnum.RED,
                        label: `${discordEmojis.x} Cancel`,
                        custom_id: UpdatePlaylistButtonsEnum.CANCEL,
                    },
                    {
                        style: ButtonsStyleEnum.GRENN,
                        label: `${discordEmojis.save} Save`,
                        custom_id: UpdatePlaylistButtonsEnum.SAVE,
                    },
                ],
            ],
        }).call();
    }

    private mapSongsToPagination(): SongData[] {
        if (this.showSongs === 'added') {
            return Array.from(this.playlistSongs.toUpdate.added.values());
        }

        if (this.showSongs === 'removed') {
            return Array.from(this.playlistSongs.toUpdate.removed.values());
        }

        // if(this.showSongs === 'playlist')
        let songList = Array.from(this.playlistSongs.current.values());

        if (this.playlistSongs.toUpdate.removed.size) {
            songList = songList.filter(
                (song: SongData) => !this.playlistSongs.toUpdate.removed.has(song.songId),
            );
        }

        if (this.playlistSongs.toUpdate.added.size) {
            songList.push(...Array.from(this.playlistSongs.toUpdate.added.values()));
        }

        return songList;
    }

    private async createSongsInPlaylistMessage(event: Message, paylist: SongData[]) {
        const playListString: string[] = paylist.map((song: SongData, i: number) => {
            return `${i + 1} - ${song.songName} '${song.duration.string}'\n`;
        });

        let title = `Playlist: ${paylist.length} songs`;
        if (this.showSongs === 'added') {
            title = `Canciones a añadir: ${paylist.length} songs`;
        }

        if (this.showSongs === 'removed') {
            title = `Canciones a eliminar: ${paylist.length} songs`;
        }

        return new PaginatedMessage({
            embed: {
                color: '#FFE4C4',
                title,
            },
            pagination: {
                channel: event.channel,
                dataToPaginate: playListString,
                dataPerPage: 10,
                timeOut: 60000,
                deleteWhenTimeOut: false,
                jsFormat: true,
                closeButton: false,
                reply: false,
            },
        }).call();
    }

    private async buttonCollector(
        event: Message,
        playlistOptionsMessage: Message,
        songsInPlaylistMessage: Message,
    ): Promise<void> {
        const collector = playlistOptionsMessage.createMessageComponentCollector({
            componentType: 'BUTTON',
            time: 60000,
        });

        collector.on('collect', async (collected) => {
            // anular mensage de Interacción fallida
            collected.deferUpdate();

            if (collected.user.id !== event.member?.id) {
                return;
            }

            collector.stop();
            // when a button is pushed, delete the song list
            await songsInPlaylistMessage.delete().catch((err) => {
                console.log('Error deleting songsInPlaylistMessage: ', err);
            });

            if (collected.customId === UpdatePlaylistButtonsEnum.ADD) {
                return this.addSongsToPlaylist(event, playlistOptionsMessage);
            }

            if (collected.customId === UpdatePlaylistButtonsEnum.ADDPLAYING) {
                return this.addPlayingSongsToPlaylist(event, playlistOptionsMessage);
            }

            if (collected.customId === UpdatePlaylistButtonsEnum.REMOVE) {
                return this.removeSongsFromPlaylist(event, playlistOptionsMessage);
            }

            if (collected.customId === UpdatePlaylistButtonsEnum.NAME) {
                return this.changePlaylistName(event, playlistOptionsMessage);
            }

            if (collected.customId === UpdatePlaylistButtonsEnum.SHOWPL) {
                this.showSongs = 'playlist';
                await this.createPlaylistOptionsMessage(event, playlistOptionsMessage);
                return;
            }

            if (collected.customId === UpdatePlaylistButtonsEnum.SHOWADDED) {
                this.showSongs = 'added';
                await this.createPlaylistOptionsMessage(event, playlistOptionsMessage);
                return;
            }

            if (collected.customId === UpdatePlaylistButtonsEnum.SHOWREMOVED) {
                this.showSongs = 'removed';
                await this.createPlaylistOptionsMessage(event, playlistOptionsMessage);
                return;
            }

            if (collected.customId === UpdatePlaylistButtonsEnum.CANCEL) {
                return;
            }

            if (collected.customId === UpdatePlaylistButtonsEnum.SAVE) {
                return this.saveChanges(event, playlistOptionsMessage);
            }
        });

        collector.on('end', async () => {
            this.usersUsingACommand.removeUserList(event.author.id);

            // when collector end buttons will disapear
            await playlistOptionsMessage.edit({ components: [] });
        });
    }

    private async addSongsToPlaylist(event: Message, playlistOptionsMessage: Message): Promise<void> {
        this.usersUsingACommand.updateUserList(event.author.id);

        // this class works almost the same that the play command
        let newSongs = await new AddSongsToPlaylist(
            this.findMusicByName,
            this.findMusicByYouTubeMobileURL,
            this.findPlayListByYoutubeURL,
            this.findMusicByYouTubeURL,
            this.findMusicBySpotifySongURL,
            this.findMusicBySpotifyPlaylistURL,
        ).call(event, this.usersUsingACommand);

        this.usersUsingACommand.removeUserList(event.author.id);

        if (newSongs instanceof Error) {
            await event.channel.send('Ha habido un error añadiendo las canciones');
            return this.createPlaylistOptionsMessage(event, playlistOptionsMessage);
        }

        if (!newSongs || (Array.isArray(newSongs) && !newSongs.length)) {
            return this.createPlaylistOptionsMessage(event, playlistOptionsMessage);
        }

        newSongs = Array.isArray(newSongs) ? newSongs : [newSongs];

        newSongs.map((song: SongData) => {
            if (this.playlistSongs.toUpdate.added.has(song.songId)) {
                return;
            }

            if (this.playlistSongs.toUpdate.removed.has(song.songId)) {
                this.playlistSongs.toUpdate.removed.delete(song.songId);
            }

            if (this.playlistSongs.current.has(song.songId)) {
                return;
            }

            this.playlistSongs.toUpdate.added.set(song.songId, song);
        });

        await this.createPlaylistOptionsMessage(event, playlistOptionsMessage);
    }

    private async addPlayingSongsToPlaylist(
        event: Message,
        playlistOptionsMessage: Message,
    ): Promise<void> {
        // add al songs from the playing ones, if they are not yet in the playlist

        const playingSongs = this.playListHandler.getPlaylist();

        playingSongs.map((song: SongData) => {
            if (this.playlistSongs.toUpdate.added.has(song.songId)) {
                return;
            }

            if (this.playlistSongs.toUpdate.removed.has(song.songId)) {
                this.playlistSongs.toUpdate.removed.delete(song.songId);
            }

            if (this.playlistSongs.current.has(song.songId)) {
                return;
            }

            this.playlistSongs.toUpdate.added.set(song.songId, song);
        });

        await this.createPlaylistOptionsMessage(event, playlistOptionsMessage);
    }

    private async removeSongsFromPlaylist(
        event: Message,
        playlistOptionsMessage: Message,
    ): Promise<void> {
        this.usersUsingACommand.updateUserList(event.author.id);

        const playlistSongs: SongData[] = [
            ...Array.from(this.playlistSongs.current.values()),
            ...Array.from(this.playlistSongs.toUpdate.added.values()),
        ];

        // remove songs, this works almost the same that RemoveSongsFromPlayListCommand
        const songsToRemove = await new RemoveSongsFromPlayList().call(event, playlistSongs, true);

        this.usersUsingACommand.removeUserList(event.author.id);

        if (songsToRemove instanceof Error) {
            await event.channel.send('Ha habido un error cambiando el nombre de la playlist');
            return this.createPlaylistOptionsMessage(event, playlistOptionsMessage);
        }

        if (!songsToRemove || !songsToRemove.length) {
            return this.createPlaylistOptionsMessage(event, playlistOptionsMessage);
        }

        songsToRemove.map((song: SongData) => {
            if (this.playlistSongs.toUpdate.removed.has(song.songId)) {
                return;
            }

            if (this.playlistSongs.toUpdate.added.has(song.songId)) {
                this.playlistSongs.toUpdate.added.delete(song.songId);
                return;
            }

            this.playlistSongs.toUpdate.removed.set(song.songId, song);
        });

        await this.createPlaylistOptionsMessage(event, playlistOptionsMessage);
    }

    private async changePlaylistName(event: Message, playlistOptionsMessage: Message): Promise<void> {
        this.usersUsingACommand.updateUserList(event.author.id);

        const response = await new ChangePlaylistName().call(event);

        this.usersUsingACommand.removeUserList(event.author.id);

        if (response instanceof Error) {
            await event.channel.send('Ha habido un error cambiando el nombre de la playlist');
            return this.createPlaylistOptionsMessage(event, playlistOptionsMessage);
        }

        if (response) {
            this.newPlaylistName = response.name;
        }

        await this.createPlaylistOptionsMessage(event, playlistOptionsMessage);
    }

    private async saveChanges(event: Message, playlistOptionsMessage: Message) {
        // if no changes will be not saved
        if (await this.isSaveNeeded()) {
            await event.channel.send('No se ha efectuado ningún cambio.');
            return;
        }

        // add new songs on DB
        if (this.playlistSongs.toUpdate.added.size) {
            await this.databaseConnection.song.create(
                Array.from(this.playlistSongs.toUpdate.added.values()),
            );
        }
        const songs = this.updateSongsArray();

        const response = await this.databaseConnection.playlist.update({
            id: this.playlistData.id,
            name: this.newPlaylistName ?? undefined,
            songsId: songs.map((song: SongData) => song.songId),
            updatedBy: event.author.id,
        });

        // Error if the author has a playlist with the same name
        if (response === ErrorEnum.BadRequest) {
            const errorMessage = await event.channel.send(
                'No se pueden tener nombres de palylist repetidos por autor, ya sea usuario o servidor.',
            );
            setTimeout(() => {
                errorMessage.delete().catch(() => '');
            }, 10000);

            this.createPlaylistOptionsMessage(event, playlistOptionsMessage);
            return;
        } else {
            // if all ok
            const userName = event.member?.nickname ?? event.author.username;
            event.channel.send(
                `Playlist: ${this.playlistData.name}  -  Author: ${
                    this.playlistData.privatePl ? userName : event.guild?.name
                }\n` + 'Modificada correctamente',
            );
        }

        return;
    }

    private async isSaveNeeded() {
        // if no changes in name or in songs
        if (
            !this.playlistSongs.toUpdate.added.size &&
            !this.playlistSongs.toUpdate.removed.size &&
            (!this.newPlaylistName || this.newPlaylistName === this.playlistData.name)
        ) {
            return true;
        }

        return false;
    }

    private updateSongsArray(): SongData[] {
        for (const [key, value] of this.playlistSongs.toUpdate.added) {
            this.playlistSongs.current.set(key, value);
        }

        for (const [key] of this.playlistSongs.toUpdate.removed) {
            this.playlistSongs.current.delete(key);
        }

        return Array.from(this.playlistSongs.current.values());
    }
}
