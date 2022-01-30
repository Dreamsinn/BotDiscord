export interface DiscordRequestRepo {
    aliases: string[],
    cooldown?: number,
    devOnly?: boolean,
    description: string,
    category: string,
    name: string,
    usage?: string,
    slash?: {},
    contextChat?: string,
    contextUser?: string,
}