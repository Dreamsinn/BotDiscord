import { Message, MessageReaction, User } from 'discord.js';
import { DisplayPlayListCommandSchema } from '../../../domain/commandSchema/displayPlayListCommandSchema';
import { discordEmojis } from '../../../domain/discordEmojis';
import { Command } from '../../../domain/interfaces/Command';
import { CommandSchema } from '../../../domain/interfaces/commandSchema';
import { PlayListHandler } from '../../playListHandler';
import { CoolDown } from '../../utils/coolDown';
import { MessageCreator } from '../../utils/messageCreator';

export class DisplayPlayListCommand extends Command {
    private displaySchema: CommandSchema = DisplayPlayListCommandSchema;
    private coolDown = new CoolDown();
    private playListHandler: PlayListHandler;
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
        const displayMessage = await this.playListHandler.activateDispaly(event);

        if (displayMessage) {
            return this.reactionListener(event, displayMessage);
        }
        return;
    }

    private reactionListener(event: Message, displayMessage: Message) {
        // Añade reacciones y escucha las reacciones recibidas, si se reacciona una de las añadidas: se borra relación y actúa dependiendo relación
        const emojiList = this.addReactions(displayMessage);

        const filter = (reaction: MessageReaction, user: User) => {
            const userCondition = !user.bot;
            const emojiCondition = emojiList.includes(reaction.emoji.name);

            return userCondition && emojiCondition;
        };

        const collector = displayMessage.createReactionCollector({ filter, time: 36000000 });
        collector.on('collect', (collected, user) => {
            this.deleteUserReaction(displayMessage, user);
            // si x borra el msenaje
            if (collected.emoji.name === discordEmojis.x) {
                return collector.stop();
            }
            // si readme, y no esta el readme activo
            if (collected.emoji.name === discordEmojis.readme && !this.showingReadme) {
                return this.createReadmeEmbed(event);
            }

            return this.reactionHandler(collected);
        });

        collector.on('end', async () => {
            this.isDisplayActive = false;
            this.playListHandler.deactivateDisplay();

            displayMessage.delete().catch(() => console.log('Display has been deleted.'));
            await event.channel.send('Display ha cesado su funcionamiento.');
            return;
        });
    }

    private addReactions(displayMessage: Message) {
        displayMessage
            .react(discordEmojis.musicEmojis.playOrPause)
            .then(() => displayMessage.react(discordEmojis.musicEmojis.nextSong))
            .then(() => displayMessage.react(discordEmojis.musicEmojis.loop))
            .then(() => displayMessage.react(discordEmojis.musicEmojis.shuffle))
            .then(() => displayMessage.react(discordEmojis.musicEmojis.clear))
            .then(() => displayMessage.react(discordEmojis.readme))
            .then(() => displayMessage.react(discordEmojis.x))
            .catch((err) => {
                console.log(err);
            });

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

        userReactions.map(
            async (reaction) =>
                await reaction.users.remove(user.id).catch(() => {
                    console.error('Failed to remove reactions.');
                }),
        );

        return;
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

    private reactionHandler(collected: MessageReaction) {
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
        const playListStatus = this.playListHandler.readPlayListStatus();

        const player = playListStatus.playerStatus;
        const connection = playListStatus.conectionStatus;
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
        const playListStatus = this.playListHandler.readPlayListStatus();

        if (playListStatus.loop) {
            return this.playListHandler.toggleLoopMode(false);
        }
        return this.playListHandler.toggleLoopMode(true);
    }
}
