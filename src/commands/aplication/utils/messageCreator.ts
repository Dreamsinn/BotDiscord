import { ButtonStyle } from 'discord-api-types';
import {MessageActionRow, MessageButton, MessageEmbed, MessageOptions } from 'discord.js';
import { MessageButtonStyles } from 'discord.js/typings/enums';
import { discordEmojis } from '../../domain/discordEmojis';
import {
    ButtonRow,
    ButtonsStyle,
    CreateMessageOptions,
    EmbedOptions,
    Button,
    MessageContent,
    ButtonRowList,
} from '../../domain/interfaces/createEmbedOptions';

export class MessageCreator {
    private message: MessageContent;
    private embed: EmbedOptions;
    private buttons: ButtonRowList;

    constructor(messageData: CreateMessageOptions) {
        this.message = messageData.message;
        this.embed = messageData.embed;
        this.buttons = messageData.buttons;
    }

    public call() {
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
            components: this.buttons ? this.rowButtonsCreator() : null,
            content: this.message ? this.message.content : null,
            embeds: embed ? [embed] : null,
        };

        return output;
    }

    private rowButtonsCreator (){
        const buttonRows = []

        this.buttons.map(( row: ButtonRow )=>{
            buttonRows.push(this.buttonCreator(row))
        })

        return buttonRows
    }

    private buttonCreator(rowData: ButtonRow){
        const buttonsRow = new MessageActionRow()

        rowData.forEach((buttonData: Button)=>{
            const button = new MessageButton()
                .setStyle( buttonData.style.valueOf() )
                .setCustomId( buttonData.custom_id ? buttonData.custom_id : null )
                .setLabel( buttonData.label ? buttonData.label : null )
                .setDisabled( buttonData.disabled ? buttonData.disabled : null)

            if(buttonData.url){
                // urls no puede ser null
                button.setURL( buttonData.url )
            }

            buttonsRow.addComponents(
                button
            )
        })
        return buttonsRow
    }
}
