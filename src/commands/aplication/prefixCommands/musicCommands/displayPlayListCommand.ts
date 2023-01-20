import { Message } from 'discord.js';
import { DisplayPlayListCommandSchema } from '../../../domain/commandSchema/displayPlayListCommandSchema';
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

export class DisplayPlayListCommand extends Command {
    private displaySchema: CommandSchema = DisplayPlayListCommandSchema;
    private playListHandler: PlayListHandler;
    private isDisplayActive = false;
    private showingReadme = false;
    private collector;

    constructor(playListHandler: PlayListHandler) {
        super();
        this.playListHandler = playListHandler;
    }

    public async call(event: Message): Promise<Message | void> {
        if (this.roleAndCooldownValidation(event, this.displaySchema)) {
            return;
        }

        if (event.content.includes('kill')) {
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
                    console.log(err);
                });
            return;
        }
        this.isDisplayActive = true;

        // pasa estado activo playListHandler y le devuelve el mensaje
        const display = await this.playListHandler.activateDispaly(event);

        if (display) {
            return this.reactionListener(event, display);
        }
        return;
    }

    private reactionListener(event: Message, display: DisplayMessage) {
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
                const interrupt = this.checkDevRole.call(event);

                if (!interrupt) {
                    return;
                }
            }

            // si x borra el msenaje
            if (collected.customId === DisplayButtonsIdEnum.CLOSE) {
                return this.collector.stop();
            }

            // si readme, y no esta el readme activo
            if (collected.customId === DisplayButtonsIdEnum.README && !this.showingReadme) {
                return this.createReadmeEmbed(display);
            }

            await this.reactionHandler(collected);
            return;
        });

        this.collector.on('end', async () => {
            this.isDisplayActive = false;
            this.playListHandler.deactivateDisplay();

            display.thread.delete().catch(() => console.log("Display' thread has been deleted."));
            display.message.delete().catch(() => console.log('Display has been deleted.'));

            if (!display.channelEventWasThread) {
                await event.channel.send('Display ha cesado su funcionamiento.');
            }
            return;
        });
    }

    private addButtonsReactions(displayMessage: Message) {
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
            ],
            [
                {
                    style: ButtonsStyleEnum.GRENN,
                    label: `${discordEmojis.musicEmojis.clear} Clear Platlist`,
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

        displayMessage.edit({ components: new MessageButtonsCreator(buttons).call() });

        return;
    }

    private createReadmeEmbed(display: DisplayMessage) {
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

        display.thread
            .send(output)
            .then((msg: Message) => {
                setTimeout(() => {
                    if (msg) {
                        msg.delete().catch((err) => {
                            console.log("Display's README error:", err);
                        });
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

    private async reactionHandler(collected) {
        const buttonId = collected.customId;

        if (buttonId === DisplayButtonsIdEnum.PLAY_PAUSE) {
            return this.playListHandler.togglePauseMusic();
        }

        if (buttonId === DisplayButtonsIdEnum.NEXT) {
            return await this.playListHandler.skipMusic();
        }

        if (buttonId === DisplayButtonsIdEnum.LOOP) {
            return this.playListHandler.toggleLoopMode();
        }

        if (buttonId === DisplayButtonsIdEnum.SHUFFLE) {
            return this.playListHandler.shufflePlayList();
        }

        if (buttonId === DisplayButtonsIdEnum.CLEAR) {
            return this.playListHandler.deletePlayList();
        }
    }
}
