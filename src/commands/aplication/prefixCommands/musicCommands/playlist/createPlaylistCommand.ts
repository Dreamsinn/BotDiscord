import { Message } from 'discord.js';
import { ConnectionHandler } from '../../../../../database/connectionHandler';
import { NewPlaylist } from '../../../../../database/playlist/domain/interfaces/newPlaylist';
import { discordEmojis } from '../../../../domain/discordEmojis';
import { ButtonsStyleEnum } from '../../../../domain/enums/buttonStyleEnum';
import { CreatePlaylistButtonsEnum } from '../../../../domain/enums/createPlaylistButtonsEnum';
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
import { PaginatedMessage } from '../../../utils/paginatedMessage';
import { UsersUsingACommand } from '../../../utils/usersUsingACommand';
import { AddSongsToPlaylist } from './utils/addSongToPlaylist';
import { ChangePlaylistName } from './utils/changePlaylistName';
import { RemoveSongsFromPlayList } from './utils/removeSongsFromPlaylist';

export class CreatePlaylistCommand extends Command {
    private playlistData: NewPlaylist;
    private playlistSongs: SongData[];

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

    public async call(event: Message, adminRole: string, createPlSchema: CommandSchema): Promise<void> {
        if (this.roleAndCooldownValidation(event, createPlSchema, adminRole)) {
            return;
        }

        // reset playlistData and playlistSongs
        this.playlistData = {
            privatePl: true,
            author: '',
            name: '',
            songsId: '',
        };
        this.playlistSongs = [];

        // if command was runed with guild, is mandatory admin role
        if (event.content.includes('guild')) {
            if (!this.checkAdminRole.call(event, adminRole)) {
                event.channel.send('Para esta accion es obligatorio el rol de admin');
                return;
            }
            this.playlistData.privatePl = false;
        }

        // Botones: añadir canciones, añadir canciones de la playlist(paginadas, con opcion para pasra todas)), quitar canciones(paginada), cancelar, guardar
        await this.createPlaylistOptionsMessage(event);
    }

    private async createPlaylistOptionsMessage(event: Message, playlistMessage: Message | null = null) {
        const playlistOptionsEmbed = this.createPlaylistOptionsEmbed(event);

        let playlistOptionsMessage: Message<boolean> | void;
        if (playlistMessage) {
            // if is called with a message, edit it to update it
            playlistOptionsMessage = await playlistMessage.edit(playlistOptionsEmbed).catch(async () => {
                await event.channel.send('Ha habido un error, se guardarán los cambios efectuados');
                // await this.saveChanges(event);
            });
        } else {
            // if first tame this method is called, create the message
            playlistOptionsMessage = await event.channel.send(playlistOptionsEmbed);
        }

        const songsInPlaylistMessage = await this.createSongsInPlaylistMessage(
            event,
            this.playlistSongs,
        );

        if (playlistOptionsMessage) {
            this.buttonCollector(event, playlistOptionsMessage, songsInPlaylistMessage);
        }
    }

    private createPlaylistOptionsEmbed(event: Message) {
        const userName = event.member?.nickname ?? event.author.username;

        this.playlistData.author = this.playlistData.privatePl ? userName : event.guild!.name;

        return new MessageCreator({
            embed: {
                color: '#d817ff',
                title: 'Crear Playlist',
                author: {
                    name: `${userName}`,
                    iconURL: `${event.member?.user.displayAvatarURL()}`,
                },
                description:
                    '**Solo** podrá interactuar la **persona** que haya **activado el comando**.\n' +
                    'Mientras este **comando** este **en uso no podrá usar otro comando**.\n',
                field: {
                    name: this.playlistData.privatePl ? 'Playlist privada:' : 'Playlist del servidor:',
                    value:
                        `> **Autor:** ${this.playlistData.author}\n` +
                        `> **Nombre playlist:** ${this.playlistData.name}\n` +
                        `> **Nº canciones:** ${this.playlistSongs.length}\n`,
                    inline: false,
                },
            },
            buttons: [
                [
                    {
                        style: ButtonsStyleEnum.BLUE,
                        label: 'Change name',
                        custom_id: CreatePlaylistButtonsEnum.NAME,
                    },
                    {
                        style: ButtonsStyleEnum.BLUE,
                        label: 'Add songs',
                        custom_id: CreatePlaylistButtonsEnum.ADD,
                    },
                    {
                        style: ButtonsStyleEnum.BLUE,
                        label: 'Add playing songs',
                        custom_id: CreatePlaylistButtonsEnum.ADDPLAYING,
                    },
                    {
                        style: ButtonsStyleEnum.BLUE,
                        label: 'Remove songs',
                        custom_id: CreatePlaylistButtonsEnum.REMOVE,
                    },
                ],
                [
                    {
                        style: ButtonsStyleEnum.RED,
                        label: `${discordEmojis.x} Cancel`,
                        custom_id: CreatePlaylistButtonsEnum.CANCEL,
                    },
                    {
                        style: ButtonsStyleEnum.GRENN,
                        label: 'Save',
                        custom_id: CreatePlaylistButtonsEnum.SAVE,
                    },
                ],
            ],
        }).call();
    }

    private async createSongsInPlaylistMessage(event: Message, paylist: SongData[]) {
        const playListString: string[] = paylist.map((song: SongData, i: number) => {
            return `${i + 1} - ${song.songName} '${song.duration.string}'\n`;
        });

        return new PaginatedMessage({
            embed: {
                color: '#FFE4C4',
                title: `Playlist: ${paylist.length} songs`,
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
            await songsInPlaylistMessage.delete().catch((err) => {
                console.log('Error deleting songsInPlaylistMessage: ', err);
            });

            if (collected.customId === CreatePlaylistButtonsEnum.CANCEL) {
                collector.stop();
                console.log('canceled');
                return;
            }

            if (collected.customId === CreatePlaylistButtonsEnum.SAVE) {
                collector.stop();
                console.log('save');
                return;
            }

            if (collected.customId === CreatePlaylistButtonsEnum.ADD) {
                collector.stop();
                return this.addSongsToPlaylist(event, playlistOptionsMessage);
            }

            if (collected.customId === CreatePlaylistButtonsEnum.ADDPLAYING) {
                collector.stop();
                return this.addPlayingSongsToPlaylist(event, playlistOptionsMessage);
            }

            if (collected.customId === CreatePlaylistButtonsEnum.REMOVE) {
                collector.stop();
                return this.removeSongsFromPlaylist(event, playlistOptionsMessage);
            }

            if (collected.customId === CreatePlaylistButtonsEnum.NAME) {
                collector.stop();
                return this.changePlaylistName(event, playlistOptionsMessage);
            }
        });

        collector.on('end', async () => {
            this.usersUsingACommand.removeUserList(event.author.id);

            // when collector end buttons will disapear
            await playlistOptionsMessage.edit({ components: [] });
        });
    }

    private async addSongsToPlaylist(event: Message, playlistOptionsMessage: Message): Promise<void> {
        let newSongs = await new AddSongsToPlaylist(
            this.findMusicByName,
            this.findMusicByYouTubeMobileURL,
            this.findPlayListByYoutubeURL,
            this.findMusicByYouTubeURL,
            this.findMusicBySpotifySongURL,
            this.findMusicBySpotifyPlaylistURL,
        ).call(event);

        if (newSongs instanceof Error) {
            await event.channel.send('Ha habido un error añadiendo las canciones');
            return this.createPlaylistOptionsMessage(event, playlistOptionsMessage);
        }

        if (!newSongs || (Array.isArray(newSongs) && !newSongs.length)) {
            return this.createPlaylistOptionsMessage(event, playlistOptionsMessage);
        }

        newSongs = Array.isArray(newSongs) ? newSongs : [newSongs];

        newSongs.forEach((newSong: SongData) => {
            if (!this.playlistSongs.some((song: SongData) => newSong.songId === song.songId)) {
                this.playlistSongs.push(newSong);
            }
        });

        await this.createPlaylistOptionsMessage(event, playlistOptionsMessage);
    }

    private async addPlayingSongsToPlaylist(
        event: Message,
        playlistOptionsMessage: Message,
    ): Promise<void> {
        const playingSongs = this.playListHandler.getPlaylist();
        playingSongs.forEach((newSong: SongData) => {
            if (!this.playlistSongs.some((song: SongData) => newSong.songId === song.songId)) {
                this.playlistSongs.push(newSong);
            }
        });

        await this.createPlaylistOptionsMessage(event, playlistOptionsMessage);
    }

    private async removeSongsFromPlaylist(
        event: Message,
        playlistOptionsMessage: Message,
    ): Promise<void> {
        const modifiedPlaylist = await new RemoveSongsFromPlayList().call(event, this.playlistSongs);

        if (modifiedPlaylist instanceof Error) {
            await event.channel.send('Ha habido un error cambiando el nombre de la playlist');
            return this.createPlaylistOptionsMessage(event, playlistOptionsMessage);
        }

        if (modifiedPlaylist) {
            this.playlistSongs = modifiedPlaylist;
        }

        await this.createPlaylistOptionsMessage(event, playlistOptionsMessage);
    }

    private async changePlaylistName(event: Message, playlistOptionsMessage: Message): Promise<void> {
        const response = await new ChangePlaylistName().call(event);

        if (response instanceof Error) {
            await event.channel.send('Ha habido un error cambiando el nombre de la playlist');
            return this.createPlaylistOptionsMessage(event, playlistOptionsMessage);
        }

        if (response) {
            this.playlistData.name = response.name;
        }

        await this.createPlaylistOptionsMessage(event, playlistOptionsMessage);
    }
}
