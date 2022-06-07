import {
    ColorResolvable,
    EmbedAuthorData,
    EmbedFieldData,
    EmbedFooterData,
    Message,
    User,
} from 'discord.js';
import { songData } from './songData';

// hay mas opciones disponibles en MessageOptions
export interface createMessageOptions {
    message?: messageOptions;
    embed?: embedOptions;
    pagination?: paginationOptions;
}

export interface embedOptions {
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

export interface messageOptions {
    content: string;
}

export interface paginationOptions {
    event?: Message;
    channel?: Message['channel'];
    rawDataToPaginate?: songData[];
    dataToPaginate?: string[];
    dataPerPage: number;
    timeOut: number;
    jsFormat: boolean;
    reply: boolean;
    author?: User;
}
