import { ColorResolvable, EmbedAuthorData, EmbedFieldData, EmbedFooterData } from "discord.js";

// hay mas opciones disponibles en MessageOptions
export interface createMessageOptions {
    message?: messageOptions
    embed?: embedOptions,
    pagination?: paginationOptions
}

export interface embedOptions {
    color?: ColorResolvable,
    title?: string,
    URL?: string,
    author?: EmbedAuthorData,
    description?: string,
    thumbnailUrl?: string,
    fields?: EmbedFieldData[],
    field?: {
        name: string,
        value: string,
        inline: boolean
    },
    imageUrl?: string,
    timeStamp?: Date | number | null,
    footer?: EmbedFooterData

}

export interface messageOptions {
    content: string,
}

export interface paginationOptions {
    timeOut: number,
}