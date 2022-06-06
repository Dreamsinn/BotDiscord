export interface CommandSchema {
    aliases: string[],
    coolDown?: number,
    devOnly?: boolean,
    description: string,
    category: string,
    name: string,
    usage?: string,
    slash?: {},
    contextChat?: string,
    contextUser?: string,
}