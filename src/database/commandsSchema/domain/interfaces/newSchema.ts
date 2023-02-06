import { CommandsNameEnum } from '../../../../commands/domain/enums/commandNamesEnum';
import { CommandsCategoryEnum } from '../../../../commands/domain/enums/commandsCategoryEnum';

export interface NewSchema {
    guildId: string;
    name: string;
    aliases: string;
    coolDown: number;
    adminOnly: boolean;
    description: string;
    command: CommandsNameEnum;
    category: CommandsCategoryEnum;
}
