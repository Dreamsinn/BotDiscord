import {
    ColorResolvable,
    EmbedAuthorData,
    EmbedFieldData,
    EmbedFooterData,
    Message,
    User,
} from 'discord.js';
import { SongData } from './songData';

// hay mas opciones disponibles en MessageOptions
export interface CreateMessageOptions {
    message?: MessageContent;
    embed?: EmbedOptions;
    pagination?: PaginationOptions;
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

export interface MessageContent {
    content: string;
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
