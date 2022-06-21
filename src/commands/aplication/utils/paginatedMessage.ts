import { Message, MessageReaction, User } from 'discord.js';
import { discordEmojis } from '../../domain/discordEmojis';
import {
    createMessageOptions,
    embedOptions,
    messageOptions,
    paginationOptions,
} from '../../domain/interfaces/createEmbedOptions';
import { songData } from '../../domain/interfaces/songData';
import { MessageCreator } from './messageCreator';

export class PaginatedMessage {
    private message: messageOptions;
    private embed: embedOptions;
    private pagination: paginationOptions;
    private page = 1;
    private paginatedStringData: string[];

    constructor(messageData: createMessageOptions) {
        this.message = messageData.message;
        this.embed = messageData.embed;
        this.pagination = messageData.pagination;
    }

    public async call() {
        // si la informacion es una lista de canciones, la convierte en un [] de estings
        if (this.pagination.rawDataToPaginate) {
            this.pagination.dataToPaginate = this.createPaginationData();
        }

        this.paginatedStringData = this.paginateData();

        const output = this.createPageEmbed();

        let message: Message;
        if (this.pagination.reply) {
            message = await this.pagination.event.reply(output);
        } else
            message = this.pagination.event
                ? await this.pagination.event.channel.send(output)
                : await this.pagination.channel.send(output);

        const maxPage = this.paginatedStringData.length;
        if (!(maxPage > 1)) {
            return;
        }

        message.react(discordEmojis['<-']);
        message.react(discordEmojis['->']);
        message.react(discordEmojis.x);

        this.reactionListener(message, maxPage);

        return message;
    }

    private createPaginationData() {
        const playListString: string[] = [];

        this.pagination.rawDataToPaginate.forEach((e: songData, i: number) => {
            playListString.push(this.mapPagesData(e, i));
        });
        return playListString;
    }

    private mapPagesData(songData: songData, index: number) {
        const songsString = `${index + 1} - ${songData.songName} '${songData.duration.string}'\n`;

        return songsString;
    }

    private paginateData() {
        const paginatedData: string[][] = [];

        // convierte un arr
        while (this.pagination.dataToPaginate.length > 0) {
            paginatedData.push(this.pagination.dataToPaginate.splice(0, this.pagination.dataPerPage));
        }

        const paginatedStringData: string[] = [];
        paginatedData.forEach((songPage: string[]) => {
            paginatedStringData.push(this.convertPageToString(songPage));
        });

        return paginatedStringData;
    }

    private convertPageToString(songPage: string[]) {
        let pageStringData: string;
        if (this.pagination.jsFormat) {
            pageStringData = '```js\n';
        } else pageStringData = '';

        songPage.forEach((songString: string) => {
            pageStringData += songString;
        });

        if (this.pagination.jsFormat) {
            pageStringData += '```';
        }

        return pageStringData;
    }

    private createPageEmbed() {
        const output = new MessageCreator({
            message: {
                content: this.message ? this.message.content : null,
            },
            embed: {
                color: this.embed.color ? this.embed.color : null,
                title: this.embed.title ? this.embed.title : null,
                URL: this.embed.URL ? this.embed.URL : null,
                author: this.embed.author ? this.embed.author : null,
                description:
                    this.paginatedStringData.length === 1 && this.embed.description
                        ? this.embed.description + '\n' + `${this.paginatedStringData[this.page - 1]}`
                        : this.paginatedStringData.length === 1
                            ? this.paginatedStringData[this.page - 1]
                            : this.embed.description
                                ? this.embed.description
                                : null,
                thumbnailUrl: this.embed.thumbnailUrl ? this.embed.thumbnailUrl : null,
                fields: this.embed.fields ? this.embed.fields : null,
                field:
                    this.paginatedStringData.length > 1
                        ? {
                            name: `Page [${this.page}/${this.paginatedStringData.length}]`,
                            value: `${this.paginatedStringData[this.page - 1]}`,
                            inline: false,
                        }
                        : null,
                imageUrl: this.embed.imageUrl ? this.embed.imageUrl : null,
                timeStamp: this.embed.timeStamp ? this.embed.timeStamp : null,
                footer: this.embed.footer ? this.embed.footer : null,
            },
        }).call();
        return output;
    }

    private reactionListener(message: Message, maxPage: number) {
        const filter = (reaction: MessageReaction, user: User) => {
            let userCondition: boolean;
            if (this.pagination.author) {
                userCondition = this.pagination.author.id === user.id;
            } else {
                userCondition = !user.bot;
            }
            const emojiCondition = [discordEmojis['<-'], discordEmojis['->'], discordEmojis.x].includes(
                reaction.emoji.name,
            );

            return userCondition && emojiCondition;
        };

        const collector = message.createReactionCollector({
            filter,
            time: this.pagination.timeOut,
        });
        collector.on('collect', (collected, user) => {
            if (collected.emoji.name === discordEmojis.x) {
                // kill collector
                return collector.stop();
            }
            return this.reactionHandler(message, collected, user, maxPage);
        });

        collector.on('end', async () => {
            const output = new MessageCreator({
                message: {
                    content: discordEmojis.x,
                },
            }).call();
            await message.edit(output).catch((err) => {
                console.log({ err });
            });
            console.log(`Pagination collector time Out`);
            return;
        });
    }

    private reactionHandler(message: Message, collected: MessageReaction, user: User, maxPage: number) {
        this.deleteUserReaction(message, user);

        let pageChanged: boolean;

        const emoji = collected.emoji.name;
        // si se ha tirado hacia atras, y la pagina es superior a 0: disminuimos pagina
        if (emoji === discordEmojis['<-'] && this.page > 1) {
            pageChanged = true;
            this.page--;
        }
        // si se ha tiarado hacia delante, y la pagina es inferior a la pagina maxima: aumentamos pagina
        if (emoji === discordEmojis['->'] && this.page < maxPage) {
            pageChanged = true;
            this.page++;
        }

        // si se ha cambiado la pagina edita el embed con la info de la pagina actual
        if (pageChanged) {
            const output = this.createPageEmbed();

            return message.edit(output);
        }
        return;
    }

    private async deleteUserReaction(message: Message, user: User) {
        const userReactions = message.reactions.cache.filter((reaction) =>
            reaction.users.cache.has(user.id),
        );

        try {
            userReactions.map(async (reaction) => await reaction.users.remove(user.id));
        } catch (error) {
            console.error('Failed to remove reactions.');
        }
    }
}
