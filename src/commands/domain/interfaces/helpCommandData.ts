export interface HelpCommandData {
    name: string;
    description: string;
    aliases: string[];
    coolDown: number;
    category: string;
    roleRequired: boolean;
}

export interface HelpCommandList {
    prefix: HelpCommandData[],
    nonPrefix: HelpCommandData[],
    music: HelpCommandData[],
}
