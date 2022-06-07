export interface CommandSchema {
    aliases: string[];
    coolDown?: number;
    devOnly?: boolean;
    description: string;
    category: string;
    name: string;
    usage?: string;
    slash?: Record<string, unknown>;
    contextChat?: string;
    contextUser?: string;
}
