import { Message } from 'discord.js';
import { DiceCommand } from '../../aplication/diceCommand';
import { ReplyCommand } from '../../aplication/replyCommand';
import { CheckDevRole } from '../../aplication/utils/checkDevRole';
import { CoolDown } from '../../aplication/utils/coolDown';
import { CommandSchema } from './commandSchema';

export abstract class Command {
    private coolDown = new CoolDown();
    protected checkDevRole = new CheckDevRole();

    abstract call(event: Message, props?: DiceCommand | ReplyCommand);

    protected roleAndCooldownValidation(event: Message, schema: CommandSchema): boolean {
        let interrupt = false;

        //role check
        if (schema.adminOnly) {
            if (!this.checkDevRole.call(event)) {
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
