import { Message, MessageReaction, User } from 'discord.js';
import { discordEmojis } from '../../domain/discordEmojis';
import {
    ButtonRowList,
    ButtonsStyle,
    CreateMessageOptions,
    EmbedOptions,
    MessageContent,
    PaginationOptions,
} from '../../domain/interfaces/createEmbedOptions';
import { PaginationButtonsId } from '../../domain/paginationButtonsId'
import { SongData } from '../../domain/interfaces/songData';
import { MessageButtonsCreator } from './messageButtonsCreator';
import { MessageCreator } from './messageCreator';

export class PaginatedMessage {
    private message: MessageContent;
    private embed: EmbedOptions;
    private pagination: PaginationOptions;
    private page = 1;
    private paginatedStringData: string[];

    constructor(messageData: CreateMessageOptions) {
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

        let paginatedMessage: Message;
        if (this.pagination.reply) {
            paginatedMessage = await this.pagination.event.reply(output);
        } else
            paginatedMessage = this.pagination.event
                ? await this.pagination.event.channel.send(output)
                : await this.pagination.channel.send(output);

        const maxPage = this.paginatedStringData.length;
        if (!(maxPage > 1)) {
            return;
        }

        this.addButtonsReactions(paginatedMessage)

        this.reactionListener(paginatedMessage, maxPage);

        return paginatedMessage;
    }

    private createPaginationData() {
        const playListString: string[] = [];

        this.pagination.rawDataToPaginate.forEach((e: SongData, i: number) => {
            playListString.push(this.mapPagesData(e, i));
        });
        return playListString;
    }

    private mapPagesData(songData: SongData, index: number) {
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

    private addButtonsReactions(paginatedMessage: Message){
        const buttons: ButtonRowList = [
            [
                {
                    style: ButtonsStyle.BLUE,
                    label: discordEmojis['<-'],
                    custom_id: PaginationButtonsId.PREV,
                },
                {
                    style: ButtonsStyle.BLUE,
                    label: discordEmojis['->'],
                    custom_id: PaginationButtonsId.NEXT,
                },
                {
                    style: ButtonsStyle.RED,
                    label: discordEmojis.x,
                    custom_id: PaginationButtonsId.X,
                }
            ]
        ]
        paginatedMessage.edit({components: new MessageButtonsCreator(buttons).call()})

        return
    }

    private reactionListener(message: Message, maxPage: number) {

        const collector = message.createMessageComponentCollector({ componentType: 'BUTTON', time: this.pagination.timeOut })
        
        collector.on('collect', collected => {
            // anular mensage de Interacción fallida
            collected.deferUpdate()
            if (collected.customId === PaginationButtonsId.X) {
                // kill collector
                return collector.stop();
            }
            this.reactionHandler(message, collected, maxPage);
        })

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

    private reactionHandler(message: Message, collected, maxPage: number) {
        let pageChanged: boolean;

        const collectedId = collected.customId;
        // si se ha tirado hacia atras, y la pagina es superior a 0: disminuimos pagina
        if (collectedId === PaginationButtonsId.PREV && this.page > 1) {
            pageChanged = true;
            this.page--;
        }
        // si se ha tiarado hacia delante, y la pagina es inferior a la pagina maxima: aumentamos pagina
        if (collectedId === PaginationButtonsId.NEXT && this.page < maxPage) {
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
}
