import { MessageEmbed, MessageOptions } from 'discord.js';
import {
    ButtonRowList,
    CreateMessageOptions,
    EmbedOptions,
    MessageContent,
} from '../../domain/interfaces/createEmbedOptions';
import { MessageButtonsCreator } from './messageButtonsCreator';

export class MessageCreator {
    private message: MessageContent;
    private embed: EmbedOptions;
    private buttons: ButtonRowList;

    constructor(messageData: CreateMessageOptions) {
        this.message = messageData.message;
        this.embed = messageData.embed;
        this.buttons = messageData.buttons;
    }

    public call(): MessageOptions {
        let embed;
        if (this.embed) {
            embed = new MessageEmbed();
            this.embed.color ? embed.setColor(this.embed.color) : null;
            this.embed.title ? embed.setTitle(this.embed.title) : null;
            this.embed.URL ? embed.setURL(this.embed.URL) : null;
            this.embed.author ? embed.setAuthor(this.embed.author) : null;
            this.embed.description ? embed.setDescription(this.embed.description) : null;
            this.embed.thumbnailUrl ? embed.setThumbnail(this.embed.thumbnailUrl) : null;
            this.embed.fields ? embed.setFields(this.embed.fields) : null;
            this.embed.field
                ? embed.addField(this.embed.field.name, this.embed.field.value, this.embed.field.inline)
                : null;
            this.embed.imageUrl ? embed.setImage(this.embed.imageUrl) : null;
            this.embed.timeStamp ? embed.setTimestamp(this.embed.timeStamp) : null;
            this.embed.footer ? embed.setFooter(this.embed.footer) : null;
        }

        const output: MessageOptions = {
            components: this.buttons ? new MessageButtonsCreator(this.buttons).call() : null,
            content: this.message ? this.message.content : null,
            embeds: embed ? [embed] : null,
        };

        return output;
    }
}
