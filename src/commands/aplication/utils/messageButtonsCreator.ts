import { MessageActionRow, MessageButton } from 'discord.js';
import { Button, ButtonRow, ButtonRowList } from '../../domain/interfaces/createEmbedOptions';

export class MessageButtonsCreator {
    private buttons: ButtonRowList;

    constructor(buttons: ButtonRowList) {
        this.buttons = buttons;
    }

    public call(): MessageActionRow[] {
        const buttonRows: MessageActionRow[] = [];
        this.buttons.forEach((row: ButtonRow | undefined) => {
            if (row) {
                buttonRows.push(this.buttonCreator(row));
            }
        });

        return buttonRows;
    }

    private buttonCreator(rowData: ButtonRow) {
        const buttonsRow = new MessageActionRow();

        rowData.forEach((buttonData: Button | undefined) => {
            if (buttonData) {
                const button = new MessageButton()
                    .setStyle(buttonData.style.valueOf())
                    .setCustomId(buttonData.custom_id)
                    .setLabel(buttonData.label)
                    .setDisabled(buttonData.disabled === undefined ? false : buttonData.disabled);

                if (buttonData.url) {
                    // urls no puede ser null
                    button.setURL(buttonData.url);
                }

                buttonsRow.addComponents(button);
            }
        });
        return buttonsRow;
    }
}
