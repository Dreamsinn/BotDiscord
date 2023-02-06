import { CommandsNameEnum } from '../enums/commandNamesEnum';
import { CommandsCategoryEnum } from '../enums/commandsCategoryEnum';

export interface CommandSchema {
    name: string;
    aliases: string[];
    coolDown: number;
    adminOnly: boolean;
    description: string;
    command: CommandsNameEnum;
    category: CommandsCategoryEnum;
}
