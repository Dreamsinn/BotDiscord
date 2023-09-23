import { Message } from 'discord.js';
import { Languages } from '../../../languages/languageService';
import { DiceCommand } from '../../aplication/non-prefixCommands/diceCommand';
import { ReplyCommand } from '../../aplication/non-prefixCommands/replyCommand';
import { CheckAdminRole } from '../../aplication/utils/checkAdminRole';
import { CoolDown } from '../../aplication/utils/coolDown';
import { UsersUsingACommand } from '../../aplication/utils/usersUsingACommand';
import { CommandSchema } from './commandSchema';
import { SchemaDictionary } from './schemaDictionary';

export interface CommandProps {
    usersUsingACommand?: UsersUsingACommand;
    diceCommand?: DiceCommand;
    replyCommand?: ReplyCommand;
    schemaList?: SchemaDictionary;
    prefix?: string;
    language?: Languages;
}

export abstract class Command {
    private coolDown = new CoolDown();
    protected checkAdminRole = new CheckAdminRole();

    abstract call(
        event: Message,
        adminRole: string,
        schema: CommandSchema,
        props?: CommandProps,
    ): Promise<void>;

    protected roleAndCooldownValidation(
        event: Message,
        schema: CommandSchema,
        adminRole: string,
    ): boolean {
        let interrupt = false;

        //role check
        if (schema.adminOnly) {
            if (!this.checkAdminRole.call(event, adminRole)) {
                interrupt = true;
            }
        }

        //comprobar coolDown
        if (this.coolDown.call(schema.coolDown, event)) {
            interrupt = true;
        }

        return interrupt;
    }
}
