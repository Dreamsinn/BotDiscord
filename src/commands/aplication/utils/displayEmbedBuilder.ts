import { EmbedFieldData, Message, ThreadChannel } from 'discord.js';
import { discordEmojis } from '../../domain/discordEmojis';
import { EmbedOptions } from '../../domain/interfaces/createEmbedOptions';
import { DisplayMessage } from '../../domain/interfaces/displayMessage';
import { PlayListStatus } from '../../domain/interfaces/PlayListStatus';
import { SongData } from '../../domain/interfaces/song';
import { MessageCreator } from '../utils/messageCreator';

export class DisplayEmbedBuilder {
    private playListStatus: PlayListStatus;
    private displayMessage: Message;

    public async call(
        playListStatus: PlayListStatus,
        event: Message | undefined,
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
                channelEventWasThread: event?.channel.isThread() ? true : false,
                message: (this.displayMessage = await thread.send(output)),
            };
            return display;
        }

        if (this.displayMessage) {
            await this.displayMessage
                .edit({ embeds: output.embeds, components: this.displayMessage.components })
                .catch((err) => {
                    console.log('Error editing display', err);
                });
        }
    }

    private async selectChannel(event: any): Promise<ThreadChannel> {
        // si el chat es un hilo lo devolvemos
        if (event.channel.isThread()) {
            return event.channel;
        }

        // buscamos si el chat tiene un hilo con el nombre de displayer, y si existe se fevuelve
        const threadChannel: ThreadChannel = event.channel.threads.cache.find(
            (thread: ThreadChannel) => {
                if (thread.name === 'Displayer') {
                    return thread;
                }
            },
        );
        if (threadChannel) {
            return threadChannel;
        }

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

    private mapTitleAndURlData(
        playinSong: SongData,
        playerStatus: string,
        conectionStatus: string,
    ): { title: string; URL: string | undefined } {
        const titleAndURLOptions: { condition: boolean; title: string; URL: string | undefined }[] = [
            {
                condition: !playerStatus || !conectionStatus,
                title: `${discordEmojis.problem} La función de música aún no está activada, añada alguna cancion`,
                URL: undefined,
            },
            {
                condition: conectionStatus === 'destroyed',
                title:
                    `${discordEmojis.problem} Es necesario reconectar el bot, usa los comandos:` +
                    ` play o join`,
                URL: undefined,
            },
            {
                condition: playerStatus === 'idle',
                title: '**Ready to play!**',
                URL: undefined,
            },
            {
                condition: playerStatus === 'paused',
                title: `${discordEmojis.musicEmojis.pause} Pausado\n` + `${playinSong?.songName}`,
                URL: `https://www.youtube.com/watch?v=${playinSong?.songId}`,
            },
            {
                condition: true, //default
                title:
                    `${discordEmojis.musicEmojis.playing} Playing ${discordEmojis.musicEmojis.playing}\n` +
                    `${playinSong?.songName}`,
                URL: `https://www.youtube.com/watch?v=${playinSong?.songId}`,
            },
        ];
        const titleAndUrl = titleAndURLOptions.find(
            (option: { condition: boolean; title: string; URL: string | undefined }) => option.condition,
        );

        return {
            title: titleAndUrl!.title,
            URL: titleAndUrl!.URL,
        };
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
    }: PlayListStatus): { duration: string; queueData: string } {
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

    private mapSongThumbnailUrl(
        playinSong: SongData,
        playerStatus: string,
        conectionStatus: string,
    ): string | undefined {
        if (
            !playerStatus ||
            !conectionStatus ||
            conectionStatus === 'destroyed' ||
            playerStatus === 'idle'
        ) {
            return;
        }
        if (playinSong?.thumbnails) {
            return playinSong.thumbnails;
        }
        return;
    }

    private mapNextSongData(playList: SongData[]): EmbedFieldData | void {
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
