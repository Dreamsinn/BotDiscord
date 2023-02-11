import { ButtonInteraction, CacheType, InteractionCollector, Message } from 'discord.js';
import { discordEmojis } from '../../../domain/discordEmojis';
import { ButtonsStyleEnum } from '../../../domain/enums/buttonStyleEnum';
import { DisplayButtonsIdEnum } from '../../../domain/enums/displayButtonsIdEnum';
import { ButtonRowList } from '../../../domain/interfaces/button';
import { Command } from '../../../domain/interfaces/Command';
import { CommandSchema } from '../../../domain/interfaces/commandSchema';
import { DisplayMessage } from '../../../domain/interfaces/displayMessage';
import { PlayListHandler } from '../../playListHandler';
import { MessageButtonsCreator } from '../../utils/messageButtonsCreator';
import { MessageCreator } from '../../utils/messageCreator';
import { PaginatedMessage } from '../../utils/paginatedMessage';

export class DisplayPlayListCommand extends Command {
    private isDisplayActive = false;
    private showingReadme = false;
    private playListEmbed: Message | undefined;
    private collector: InteractionCollector<ButtonInteraction<CacheType>>;

    constructor(private displaySchema: CommandSchema, private playListHandler: PlayListHandler) {
        super();
    }

    public async call(event: Message, adminRole: string): Promise<void> {
        if (this.roleAndCooldownValidation(event, this.displaySchema, adminRole)) {
            return;
        }

        if (event.content.includes('kill')) {
            console.log({ argument: 'kill' });
            return this.collector.stop();
        }

        // si ya hay un display activo
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
                    console.log('Is Display Active message error: ', err);
                });
            return;
        }
        this.isDisplayActive = true;

        // pasa estado activo playListHandler y le devuelve el mensaje
        const display = await this.playListHandler.activateDispaly(event);

        if (display) {
            this.reactionListener(event, display, adminRole);
        }
        return;
    }

    private reactionListener(event: Message, display: DisplayMessage, adminRole: string): void {
        // Añade reacciones y escucha las reacciones recibidas, si se reacciona una de las añadidas: se borra relación y actúa dependiendo relación
        this.addButtonsReactions(display.message);

        this.collector = display.message.createMessageComponentCollector({
            componentType: 'BUTTON',
            time: 86400000,
        });

        this.collector.on('collect', async (collected) => {
            // anular mensage de Interacción fallida
            collected.deferUpdate();

            if (this.displaySchema.adminOnly) {
                if (!this.checkDevRole.call(event, adminRole)) {
                    return;
                }
            }

            // si x borra el msenaje
            if (collected.customId === DisplayButtonsIdEnum.CLOSE) {
                this.collector.stop();
                return;
            }

            // si readme, y no esta el readme activo
            if (collected.customId === DisplayButtonsIdEnum.README && !this.showingReadme) {
                this.createReadmeEmbed(display);
                return;
            }

            // si show playlist, y no esta el playlist embed activo
            if (collected.customId === DisplayButtonsIdEnum.PLAYLIST) {
                // check if has been created before check if already exist
                if (this.playListEmbed) {
                    let isAlreadyActive = true;

                    // if this fail, means that was deleted
                    await display.thread.messages
                        .fetch(this.playListEmbed.id)
                        .catch(() => (isAlreadyActive = false));

                    if (isAlreadyActive) {
                        return;
                    }
                }
                await this.createPlaylistEmbed(display);
                return;
            }

            await this.reactionHandler(collected);
            return;
        });

        this.collector.on('end', async () => {
            this.isDisplayActive = false;
            this.playListHandler.deactivateDisplay();

            display.thread.delete().catch(() => console.log("Display's thread has been deleted."));
            display.message.delete().catch(() => console.log('Display has been deleted.'));

            if (!display.channelEventWasThread) {
                await event.channel.send('Display ha cesado su funcionamiento.');
            }
            return;
        });
    }

    private addButtonsReactions(displayMessage: Message): void {
        const buttons: ButtonRowList = [
            [
                {
                    style: ButtonsStyleEnum.BLUE,
                    label: `${discordEmojis.musicEmojis.playOrPause} Play/Pause`,
                    custom_id: DisplayButtonsIdEnum.PLAY_PAUSE,
                },
                {
                    style: ButtonsStyleEnum.BLUE,
                    label: `${discordEmojis.musicEmojis.nextSong} Next song`,
                    custom_id: DisplayButtonsIdEnum.NEXT,
                },
                {
                    style: ButtonsStyleEnum.BLUE,
                    label: `${discordEmojis.musicEmojis.loop} Loop mode`,
                    custom_id: DisplayButtonsIdEnum.LOOP,
                },
                {
                    style: ButtonsStyleEnum.BLUE,
                    label: `${discordEmojis.musicEmojis.shuffle} Shuffle`,
                    custom_id: DisplayButtonsIdEnum.SHUFFLE,
                },
                {
                    style: ButtonsStyleEnum.BLUE,
                    label: `${discordEmojis.musicEmojis.playing} Show Playlist`,
                    custom_id: DisplayButtonsIdEnum.PLAYLIST,
                },
            ],
            [
                {
                    style: ButtonsStyleEnum.GRENN,
                    label: `${discordEmojis.musicEmojis.clear} Clear Playlist`,
                    custom_id: DisplayButtonsIdEnum.CLEAR,
                },
                {
                    style: ButtonsStyleEnum.GREY,
                    label: `${discordEmojis.readme} Readme`,
                    custom_id: DisplayButtonsIdEnum.README,
                },
                {
                    style: ButtonsStyleEnum.RED,
                    label: `${discordEmojis.x} Close`,
                    custom_id: DisplayButtonsIdEnum.CLOSE,
                },
            ],
        ];

        displayMessage.edit({ components: new MessageButtonsCreator(buttons).call() }).catch((err) => {
            console.log('Error adding buttons to display: ', err);
        });

        return;
    }

    private createReadmeEmbed(display: DisplayMessage): void {
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
                        name: discordEmojis.musicEmojis.playing,
                        value: 'Mustra la playlist paginada',
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

        display.thread
            .send(output)
            .then((msg: Message) => {
                setTimeout(() => {
                    if (msg) {
                        msg.delete().catch((err) => {
                            console.log("Delete display's README error:", err);
                        });
                    }
                    this.showingReadme = false;
                }, 20000);
            })
            .catch((err) => {
                this.showingReadme = false;
                console.log("Display's README error:", err);
            });
        return;
    }

    private async createPlaylistEmbed(display: DisplayMessage): Promise<void> {
        const playList: string[] = this.playListHandler.readPlayList();

        const playListEmbed = await new PaginatedMessage({
            embed: {
                color: '#FFE4C4',
                title: `Playlist: ${playList.length} songs`,
            },
            pagination: {
                channel: display.thread,
                dataToPaginate: playList,
                dataPerPage: 10,
                timeOut: 30000,
                deleteWhenTimeOut: true,
                jsFormat: true,
                closeButton: true,
                reply: false,
            },
        }).call();

        this.playListEmbed = playListEmbed;
        return;
    }

    private async reactionHandler(collected: ButtonInteraction<CacheType>): Promise<void> {
        const buttonId = collected.customId;

        if (buttonId === DisplayButtonsIdEnum.PLAY_PAUSE) {
            this.playListHandler.togglePauseMusic();
            return;
        }

        if (buttonId === DisplayButtonsIdEnum.NEXT) {
            await this.playListHandler.skipMusic();
            return;
        }

        if (buttonId === DisplayButtonsIdEnum.LOOP) {
            this.playListHandler.toggleLoopMode();
            return;
        }

        if (buttonId === DisplayButtonsIdEnum.SHUFFLE) {
            this.playListHandler.shufflePlayList();
            return;
        }

        if (buttonId === DisplayButtonsIdEnum.CLEAR) {
            this.playListHandler.deletePlayList();
            return;
        }
    }
}
