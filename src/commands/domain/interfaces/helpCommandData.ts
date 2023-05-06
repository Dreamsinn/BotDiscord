import { CommandsCategoryEnum } from '../enums/commandsCategoryEnum';
import { HelpEmbedsTitlesEnum } from '../enums/helpEmbedsTitlesEnum';
export interface HelpCommandData {
    name: string;
    description: string;
    aliases: string[];
    coolDown: number;
    category: CommandsCategoryEnum;
    roleRequired: boolean;
}

export interface HelpCommandList {
    prefix: HelpCommandData[];
    nonPrefix: HelpCommandData[];
    music: HelpCommandData[];
    playlist: HelpCommandData[];
}

export interface SubTypeCommandData {
    title: HelpEmbedsTitlesEnum;
    commandArray: HelpCommandData[];
}
