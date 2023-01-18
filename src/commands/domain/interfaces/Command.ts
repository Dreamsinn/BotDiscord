import { Message } from 'discord.js';
import { DiceCommand } from '../../aplication/diceCommand';
import { ReplyCommand } from '../../aplication/replyCommand';
import { CheckDevRole } from '../../aplication/utils/checkDevRole';
import { CoolDown } from '../../aplication/utils/coolDown';
import { UsersUsingACommand } from '../../aplication/utils/usersUsingACommand';
import { CommandSchema } from './commandSchema'

export abstract class Command {
    private coolDown = new CoolDown();
    protected checkDevRole = new CheckDevRole();

    abstract call(event: Message, props?: UsersUsingACommand | DiceCommand | ReplyCommand);

    protected roleAndCooldownValidation(event: Message, schema: CommandSchema): boolean {
        let interrupt = false;

        //role check
        if (schema.devOnly) {
            if (!this.checkDevRole.call(event)) {
                interrupt = true
            }
        }

        //comprobar coolDown
        if (this.coolDown.call(schema.coolDown)) {
            interrupt = true
        }

        return interrupt;
    }
}
