import { CommandsCategoryEnum } from '../enums/commandsCategoryEnum';

export interface CommandSchema {
    aliases: string[];
    coolDown: number;
    adminOnly: boolean;
    description: string;
    category: CommandsCategoryEnum;
    name: string;
}
