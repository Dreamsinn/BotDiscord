import { MessageEmbed, MessageOptions } from 'discord.js';
import { ButtonRowList } from '../../domain/interfaces/button';
import { CreateMessage, EmbedOptions, MessageContent } from '../../domain/interfaces/createEmbedOptions';
import { MessageButtonsCreator } from './messageButtonsCreator';

export class MessageCreator {
    private message: MessageContent | undefined;
    private embed: EmbedOptions | undefined;
    private buttons: ButtonRowList | undefined;

    constructor(messageData: CreateMessage) {
        this.message = messageData.message;
        this.embed = messageData.embed;
        this.buttons = messageData.buttons;
    }

    public call(): MessageOptions {
        const embed = new MessageEmbed();
        if (this.embed) {
            this.embed.color ? embed.setColor(this.embed.color) : null;
            this.embed.title ? embed.setTitle(this.embed.title) : null;
            this.embed.URL ? embed.setURL(this.embed.URL) : null;
            this.embed.author ? embed.setAuthor(this.embed.author) : null;
            this.embed.description ? embed.setDescription(this.embed.description) : null;
            this.embed.thumbnailUrl ? embed.setThumbnail(this.embed.thumbnailUrl) : null;
            this.embed.fields ? embed.setFields(this.embed.fields) : null;
            this.embed.imageUrl ? embed.setImage(this.embed.imageUrl) : null;
            this.embed.timeStamp ? embed.setTimestamp(this.embed.timeStamp) : null;
            this.embed.footer ? embed.setFooter(this.embed.footer) : null;
        }

        const output: MessageOptions = {
            components: this.buttons ? new MessageButtonsCreator(this.buttons).call() : [],
            content: this.message ? this.message.content : null,
            embeds: [embed] ?? null,
        };

        return output;
    }
}
