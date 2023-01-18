import { EmbedFieldData, Message, ThreadChannel } from 'discord.js';
import { discordEmojis } from '../../domain/discordEmojis';
import { EmbedOptions } from '../../domain/interfaces/createEmbedOptions';
import { DisplayMessage } from '../../domain/interfaces/displayMessage';
import { PlayListStatus } from '../../domain/interfaces/PlayListStatus';
import { SongData } from '../../domain/interfaces/songData';
import { MessageCreator } from '../utils/messageCreator';

export class DisplayEmbedBuilder {
    private playListStatus: PlayListStatus;
    private displayMessage: Message;

    public async call(
        playListStatus: PlayListStatus,
        event: Message,
        newEmbed: boolean,
    ): Promise<DisplayMessage | void> {
        // si newEmbed crea un mensaje con toda la informacion, sino edita el mensaje ya creado
        this.playListStatus = playListStatus;

        const output = new MessageCreator({
            embed: await this.setEmbedOptionsData(),
        }).call();

        const thread = await this.selectChannel(event);

        if (newEmbed) {
            const display: DisplayMessage = {
                thread: await this.selectChannel(event),
                channelEventWasThread: event.channel.isThread() ? true : false,
                message: (this.displayMessage = await thread.send(output)),
            };
            return display;
        }

        if (this.displayMessage) {
            await this.displayMessage.edit(output).catch(() => {
                console.log('Error editing display');
            });
        }

        return;
    }

    private async selectChannel(event: Message): Promise<ThreadChannel> {
        // si el chat es un hilo lo devolvemos
        if (event.channel.isThread()) {
            return event.channel;
        }

        // buscamos si el chat tiene un hilo con el nombre de displayer, y si existe se fevuelve
        let threadChannel: ThreadChannel;
        event.channel.threads.cache.find((thread: ThreadChannel) => {
            if (thread.name === 'Displayer') {
                threadChannel = thread;
            }
        });
        if (threadChannel) {
            return threadChannel;
        }

        // si es un chat y no tiene u hilo con nombre de displayer, crea el hilo
        return await event.startThread({
            name: 'Displayer',
            autoArchiveDuration: 60,
            reason: 'Hilo para el controlador de musica',
        });
    }

    private async setEmbedOptionsData(): Promise<EmbedOptions> {
        const { title, URL } = this.mapTitleAndURlData(
            this.playListStatus.playList[0],
            this.playListStatus.playerStatus,
            this.playListStatus.conectionStatus,
        );

        const fields = this.mapFieldData(this.playListStatus);

        const thumbnailUrl = this.mapSongThumbnailUrl(
            this.playListStatus.playList[0],
            this.playListStatus.playerStatus,
            this.playListStatus.conectionStatus,
        );

        const embed: EmbedOptions = {
            color: 'RANDOM',
            title,
            URL,
            fields,
            thumbnailUrl,
        };

        return embed;
    }

    private mapTitleAndURlData(playinSong: SongData, playerStatus: string, conectionStatus: string) {
        let title: string;
        let URL: string | null;
        if (!playerStatus || !conectionStatus) {
            title = `${discordEmojis.problem} La función de música aún no está activada, añada alguna cancion`;
            URL = null;
            return { title, URL };
        }
        if (conectionStatus === 'destroyed') {
            title =
                `${discordEmojis.problem} Es necesario reconectar el bot, usa los comandos:` +
                ` ${process.env.PREFIX}p o ${process.env.PREFIX}join`;
            URL = null;
            return { title, URL };
        }
        if (playerStatus === 'idle') {
            title = '**Ready to play!**';
            URL = null;
            return { title, URL };
        }
        if (playerStatus === 'paused') {
            title = `${discordEmojis.musicEmojis.pause} Pausado\n` + `${playinSong.songName}`;
            URL = `https://www.youtube.com/watch?v=${playinSong.songId}`;
            return { title, URL };
        }

        title =
            `${discordEmojis.musicEmojis.playing} Playing ${discordEmojis.musicEmojis.playing}\n` +
            `${playinSong.songName}`;
        URL = `https://www.youtube.com/watch?v=${playinSong.songId}`;
        return { title, URL };
    }

    private mapFieldData(playListStatus: PlayListStatus): EmbedFieldData[] {
        const { duration, queueData } = this.mapDutarionQueueData(playListStatus);

        const loop = this.mapLoopData(
            playListStatus.loop,
            playListStatus.playerStatus,
            playListStatus.conectionStatus,
        );

        const nextSong = this.mapNextSongData(playListStatus.playList);

        if (nextSong) {
            return [
                nextSong,
                { name: 'Duración', value: duration, inline: true },
                { name: 'Playlist', value: queueData, inline: true },
                { name: 'Loop', value: loop, inline: true },
                { name: 'Readme', value: `${discordEmojis.readme}`, inline: true },
            ];
        }
        return [
            { name: 'Duración', value: duration, inline: true },
            { name: 'Playlist', value: queueData, inline: true },
            { name: 'Loop', value: loop, inline: true },
            { name: 'Readme', value: `${discordEmojis.readme}`, inline: true },
        ];
    }

    private mapLoopData(loop: boolean, playerStatus: string, conectionStatus: string): string {
        if (!playerStatus || !conectionStatus || conectionStatus === 'destroyed') {
            return '---';
        }
        if (loop) {
            return '`on`';
        }
        return '`off`';
    }

    private mapDutarionQueueData({
        playList,
        playListDuration,
        playerStatus,
        conectionStatus,
        ...playListStatus
    }: PlayListStatus) {
        let duration: string;
        let queueData: string;

        if (!playerStatus || !conectionStatus || conectionStatus === 'destroyed') {
            duration = queueData = '---';
            return { duration, queueData };
        }

        if (!playList[0] || playerStatus === 'idle') {
            queueData = '`0` - Canciones: `0s`';
            duration = '`0s`';
            return { duration, queueData };
        }

        duration = '`' + playList[0].duration.string + '`';
        queueData = `**${playList.length}**`;
        if (playList.length === 1) {
            queueData += ' - cancion: ';
        } else queueData += ' - canciones: ';
        queueData += '`' + playListDuration + '`';
        return { duration, queueData };
    }

    private mapSongThumbnailUrl(playinSong: SongData, playerStatus: string, conectionStatus: string) {
        if (
            !playerStatus ||
            !conectionStatus ||
            conectionStatus === 'destroyed' ||
            !playinSong ||
            playerStatus === 'idle'
        ) {
            return;
        }
        if (playinSong.thumbnails) {
            return playinSong.thumbnails;
        }
        return;
    }

    private mapNextSongData(playList: SongData[]) {
        if (playList[1]) {
            return {
                name: 'Siguiente cancion',
                value:
                    `[${playList[1].songName}](https://www.youtube.com/watch?v=${playList[1].songId}) - ` +
                    '`' +
                    `${playList[1].duration.string}` +
                    '`',
                inline: false,
            };
        }
        return;
    }
}
