export interface CommandSchema {
    aliases: string[];
    coolDown: number;
    adminOnly: boolean;
    description: string;
    category: string;
    name: string;
}
