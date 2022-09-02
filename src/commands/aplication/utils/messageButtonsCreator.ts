import {Message, MessageActionRow, MessageButton, MessageOptions } from "discord.js";
import {
    ButtonRow,
    ButtonsStyle,
    Button,
    ButtonRowList,
} from '../../domain/interfaces/createEmbedOptions';

export class MessageButtonsCreator {
    private message;
    private buttons: ButtonRowList;

    constructor(buttons: ButtonRowList ) {
        // this.message = messageData.message;
        this.buttons = buttons;
    }

    public call() {
        const buttonRows = []

        this.buttons.map(( row: ButtonRow )=>{
            buttonRows.push(this.buttonCreator(row))
        })

        return buttonRows;
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
