import {
    ColorResolvable,
    EmbedAuthorData,
    EmbedFieldData,
    EmbedFooterData,
    Message,
    User,
} from 'discord.js';
import { MessageButtonStyles } from 'discord.js/typings/enums';
import { SongData } from './songData';

// hay mas opciones disponibles en MessageOptions
export interface CreateMessageOptions {
    message?: MessageContent;
    embed?: EmbedOptions;
    buttons?: ButtonRowList;
    pagination?: PaginationOptions;
}

export interface MessageContent {
    content: string;
}

export interface EmbedOptions {
    color?: ColorResolvable;
    title?: string;
    URL?: string;
    author?: EmbedAuthorData;
    description?: string;
    thumbnailUrl?: string;
    fields?: EmbedFieldData[];
    field?: {
        name: string;
        value: string;
        inline: boolean;
    };
    imageUrl?: string;
    timeStamp?: Date | number | null;
    footer?: EmbedFooterData;
}

export type ButtonRowList = [ButtonRow?, ButtonRow?, ButtonRow?, ButtonRow?, ButtonRow?];

export type ButtonRow = [Button?, Button?, Button?, Button?, Button?];

export interface Button {
    style: ButtonsStyle;
    label: string;
    custom_id: string;
    url?: string;
    disabled?: boolean;
}

export enum ButtonsStyle {
    BLUE = MessageButtonStyles.PRIMARY,
    GREY = MessageButtonStyles.SECONDARY,
    GRENN = MessageButtonStyles.SUCCESS,
    RED = MessageButtonStyles.DANGER,
    LINK = MessageButtonStyles.LINK,
}

export interface PaginationOptions {
    event?: Message;
    channel?: Message['channel'];
    rawDataToPaginate?: SongData[];
    dataToPaginate?: string[];
    dataPerPage: number;
    timeOut: number;
    jsFormat: boolean;
    reply: boolean;
    author?: User;
}
