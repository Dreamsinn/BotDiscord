import { MessageEmbed, MessageOptions } from "discord.js";
import { createMessageOptions, embedOptions, messageOptions, paginationOptions } from "../../domain/interfaces/createEmbedOptions";

export class MessageCreator {
    private message: messageOptions;
    private embedData: embedOptions;
    private pagination: paginationOptions;

    constructor(messageData: createMessageOptions) {
        this.message = messageData.message;
        this.embedData = messageData.embed;
        this.pagination = messageData.pagination;
    }

    public call() {
        let embed;
        if (this.embedData) {
            embed = new MessageEmbed()
            this.embedData.color ? embed.setColor(this.embedData.color) : null;
            this.embedData.title ? embed.setTitle(this.embedData.title) : null;
            this.embedData.URL ? embed.setURL(this.embedData.URL) : null;
            this.embedData.author ? embed.setAuthor(this.embedData.author) : null;
            this.embedData.description ? embed.setDescription(this.embedData.description) : null;
            this.embedData.thumbnailUrl ? embed.setThumbnail(this.embedData.thumbnailUrl) : null;
            this.embedData.fields ? embed.setFields(this.embedData.fields) : null;
            this.embedData.field ? embed.addField(this.embedData.field.name, this.embedData.field.value, this.embedData.field.inline) : null;
            this.embedData.imageUrl ? embed.setImage(this.embedData.imageUrl) : null;
            this.embedData.timeStamp ? embed.setTimestamp(this.embedData.timeStamp) : null;
            this.embedData.footer ? embed.setFooter(this.embedData.footer) : null;
        }

        let output: MessageOptions = {
            content: this.message ? this.message.content : null,
            embeds: embed ? [embed] : null,
        };

        return output;
    }
}