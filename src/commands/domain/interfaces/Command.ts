import { Message } from 'discord.js';
import { DiceCommand } from '../../aplication/diceCommand';
import { ReplyCommand } from '../../aplication/replyCommand';
import { CheckAdminRole } from '../../aplication/utils/checkAdminRole';
import { CoolDown } from '../../aplication/utils/coolDown';
import { CommandSchema } from './commandSchema';

export abstract class Command {
    private coolDown = new CoolDown();
    protected checkDevRole = new CheckAdminRole();

    abstract call(event: Message, adminRole: string, props?: DiceCommand | ReplyCommand): Promise<void>;

    protected roleAndCooldownValidation(
        event: Message,
        schema: CommandSchema,
        adminRole: string,
    ): boolean {
        let interrupt = false;

        //role check
        if (schema.adminOnly) {
            if (!this.checkDevRole.call(event, adminRole)) {
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
