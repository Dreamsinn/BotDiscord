import { EmbedFieldData, Message, MessageReaction, User } from 'discord.js';
import { DisplayPlayListCommandSchema } from '../../../domain/commandSchema/displayPlayListCommandSchema';
import { discordEmojis } from '../../../domain/discordEmojis';
import { Command } from '../../../domain/interfaces/Command';
import { CommandSchema } from '../../../domain/interfaces/commandSchema';
import { embedOptions } from '../../../domain/interfaces/createEmbedOptions';
import { PlayListStatus } from '../../../domain/interfaces/PlayListStatus';
import { songData } from '../../../domain/interfaces/songData';
import { PlayListHandler } from '../../playListHandler';
import { CoolDown } from '../../utils/coolDown';
import { MessageCreator } from '../../utils/messageCreator';

export class DisplayPlayListCommand extends Command {
    private displaySchema: CommandSchema = DisplayPlayListCommandSchema;
    private coolDown = new CoolDown();
    private playListHandler: PlayListHandler;
    private playListStatus: PlayListStatus;
    private isDisplayActive = false;
    private showingReadme = false;

    constructor(playListHandler: PlayListHandler) {
        super();
        this.playListHandler = playListHandler;
    }

    public async call(event: Message) {
        //comprobar coolDown
        const interrupt = this.coolDown.call(this.displaySchema.coolDown);
        if (interrupt === 1) {
            console.log('command interrupted by cooldown');
            return;
        }
        // TODO, que sea el ultimo mensaje
        // TODO, cerrar display cunado suena peta bot
        if (this.isDisplayActive) {
            event.channel
                .send('Ya hay un display activo')
                .then((msg: Message) => {
                    setTimeout(() => {
                        event.delete();
                        msg.delete();
                    }, 10000);
                })
                .catch((err) => {
                    console.log(err);
                });
            return;
        }
        this.isDisplayActive = true;

        const output = new MessageCreator({
            embed: await this.setEmbedOptionsData(),
        }).call();

        const displayMessage = await event.channel.send(output);

        this.updateDisplatEmbed(displayMessage);

        return this.reactionListener(event, displayMessage);
    }

    public async updateDisplatEmbed(displayMessage: Message) {
        if (displayMessage) {
            setTimeout(async () => {
                const output = new MessageCreator({
                    embed: await this.setEmbedOptionsData(),
                }).call();

                await displayMessage.edit(output);
                return this.updateDisplatEmbed(displayMessage);
            }, 1000);
        }
    }

    private async setEmbedOptionsData(): Promise<embedOptions> {
        this.playListStatus = this.playListHandler.readPlayListStatusData();
        const { title, URL } = this.mapTitleAndURlData(
            this.playListStatus.playList[0],
            this.playListStatus.playerStatus,
            this.playListStatus.conectionStatus,
        );

        const fields = this.mapFieldData(this.playListStatus);

        const thumbnailUrl = await this.searchSongThumbnailUrl(
            this.playListStatus.playList[0],
            this.playListStatus.playerStatus,
            this.playListStatus.conectionStatus,
        );

        const embed: embedOptions = {
            color: 'RANDOM',
            title,
            URL,
            fields,
            thumbnailUrl,
        };

        return embed;
    }

    private mapTitleAndURlData(playinSong: songData, playerStatus: string, conectionStatus: string) {
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
                `${process.env.PREFIX}p o ${process.env.PREFIX}join`;
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
        if (!playerStatus || !conectionStatus) {
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

    private async searchSongThumbnailUrl(
        playinSong: songData,
        playerStatus: string,
        conectionStatus: string,
    ) {
        if (!playerStatus || !conectionStatus || conectionStatus === 'destroyed' || !playinSong) {
            return;
        }
        if (playinSong.thumbnails) {
            return playinSong.thumbnails;
        }
        return;
    }

    private mapNextSongData(playList: songData[]) {
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

    private reactionListener(event: Message, displayMessage: Message) {
        const emojiList = this.addReactions(event, displayMessage);

        const filter = (reaction: MessageReaction, user: User) => {
            const userCondition = !user.bot;
            const emojiCondition = emojiList.includes(reaction.emoji.name);

            return userCondition && emojiCondition;
        };

        const collector = displayMessage.createReactionCollector({ filter, time: 36000000 });
        collector.on('collect', (collected, user) => {
            this.deleteUserReaction(displayMessage, user);
            if (collected.emoji.name === discordEmojis.x) {
                return collector.stop();
            }
            if (collected.emoji.name === discordEmojis.readme && !this.showingReadme) {
                return this.createReadmeEmbed(event);
            }

            return this.reactionHandler(collected, user);
        });

        collector.on('end', async () => {
            // gestionar
            displayMessage.delete();
            this.isDisplayActive = false;
            this.playListHandler.toggleDisplayStatus(false);
            if (displayMessage) {
                return await displayMessage.edit('Display ha cesado su funcionamiento');
            }
            return;
        });
    }

    private addReactions(event: Message, displayMessage: Message) {
        try {
            displayMessage.react(discordEmojis.musicEmojis.playOrPause);
            displayMessage.react(discordEmojis.musicEmojis.nextSong);
            displayMessage.react(discordEmojis.musicEmojis.loop);
            displayMessage.react(discordEmojis.musicEmojis.shuffle);
            displayMessage.react(discordEmojis.musicEmojis.clear);
            displayMessage.react(discordEmojis.readme);
            displayMessage.react(discordEmojis.x);
        } catch (err) {
            console.log(err);
            event.channel.send(err);
            event.channel.send(
                'Ha havido un error a la hora de añadir las reaciones, porfavor, vuelva a usar el comando',
            );
        }
        return [
            discordEmojis.musicEmojis.playOrPause,
            discordEmojis.musicEmojis.nextSong,
            discordEmojis.musicEmojis.loop,
            discordEmojis.musicEmojis.shuffle,
            discordEmojis.musicEmojis.clear,
            discordEmojis.readme,
            discordEmojis.x,
        ];
    }

    private async deleteUserReaction(displayMessage: Message, user: User) {
        const userReactions = displayMessage.reactions.cache.filter((reaction) =>
            reaction.users.cache.has(user.id),
        );

        try {
            userReactions.map(async (reaction) => await reaction.users.remove(user.id));
        } catch (err) {
            console.error('Failed to remove reactions.');
        }
    }

    private createReadmeEmbed(event: Message) {
        this.showingReadme = true;
        const output = new MessageCreator({
            embed: {
                title: 'README',
                description:
                    'Display muestra toda la información relevante con referencia a la playlist, y da acceso rápido y cómodo a sus funciones.\n' +
                    'Los mensajes enviados desde Display se borrarán al poco tiempo para evitar que sea tapado por una avalancha de mensajes.\n' +
                    'Las funciones de los emojis del display son:',
                fields: [
                    {
                        name: discordEmojis.musicEmojis.playOrPause,
                        value: 'Pausa o activa la música',
                        inline: false,
                    },
                    {
                        name: discordEmojis.musicEmojis.nextSong,
                        value: 'Salta la música que está sonando',
                        inline: false,
                    },
                    {
                        name: discordEmojis.musicEmojis.loop,
                        value: 'Activa o desactiva el modo loop',
                        inline: false,
                    },
                    {
                        name: discordEmojis.musicEmojis.shuffle,
                        value: 'Aleatoriza el orden de las canciones',
                        inline: false,
                    },
                    {
                        name: discordEmojis.musicEmojis.clear,
                        value: 'Elimina todas las canciones de la playlist, menos la que esté sonando',
                        inline: false,
                    },
                    {
                        name: discordEmojis.x,
                        value: 'Acaba con los procesos del Display',
                        inline: false,
                    },
                ],
            },
        }).call();

        event.channel
            .send(output)
            .then((msg: Message) => {
                setTimeout(() => {
                    if (msg) {
                        msg.delete();
                    }
                    this.showingReadme = false;
                }, 20000);
            })
            .catch((err) => {
                this.showingReadme = false;
                console.log(err);
            });
        return;
    }

    private reactionHandler(collected: MessageReaction, user: User) {
        const emoji = collected.emoji.name;

        if (emoji === discordEmojis.musicEmojis.playOrPause) {
            return this.togglePlayPause();
        }

        if (emoji === discordEmojis.musicEmojis.nextSong) {
            return this.playListHandler.skipMusic();
        }

        if (emoji === discordEmojis.musicEmojis.loop) {
            return this.toggleLoopMode();
        }

        if (emoji === discordEmojis.musicEmojis.shuffle) {
            return this.playListHandler.shufflePlayList();
        }

        if (emoji === discordEmojis.musicEmojis.clear) {
            return this.playListHandler.deletePlayList();
        }
    }

    private togglePlayPause() {
        const player = this.playListStatus.playerStatus;
        const connection = this.playListStatus.conectionStatus;
        if (!player || !connection || connection === 'destroyed') {
            return;
        }

        if (!(player === 'paused')) {
            return this.playListHandler.pauseMusic();
        }
        if (player === 'paused') {
            this.playListHandler.unpauseMusic();
        }
        return this.playListHandler.unpauseMusic();
    }

    private toggleLoopMode() {
        if (this.playListStatus.loop) {
            return this.playListHandler.toggleLoopMode(false);
        }
        return this.playListHandler.toggleLoopMode(true);
    }
}
