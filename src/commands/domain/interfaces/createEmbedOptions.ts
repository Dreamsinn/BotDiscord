import {
    ColorResolvable,
    EmbedAuthorData,
    EmbedFieldData,
    EmbedFooterData,
    Message,
    User,
} from 'discord.js';
import { ButtonRowList } from './button';

// hay mas opciones disponibles en MessageOptions
export interface CreateMessage {
    message?: MessageContent;
    embed?: EmbedOptions;
    buttons?: ButtonRowList;
}

export interface CreatePaginatedMessage extends CreateMessage {
    embed: EmbedOptions;
    pagination: PaginationOptions;
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

export type PaginationOptions =
    | {
          reply: true;
          event: Message;
          dataToPaginate: string[];
          dataPerPage: number;
          timeOut: number;
          deleteWhenTimeOut: boolean;
          jsFormat: boolean;
          author?: User;
      }
    | {
          reply: false;
          channel: Message['channel'];
          dataToPaginate: string[];
          dataPerPage: number;
          timeOut: number;
          deleteWhenTimeOut: boolean;
          jsFormat: boolean;
          author?: User;
      };
