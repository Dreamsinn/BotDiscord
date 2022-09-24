import { Message } from 'discord.js';
import { DiceCommand } from '../../aplication/diceCommand';
import { ReplyCommand } from '../../aplication/replyCommand';
import { UsersUsingACommand } from '../../aplication/utils/usersUsingACommand';

export abstract class Command {
    abstract call(event: Message, props?: UsersUsingACommand | DiceCommand | ReplyCommand);
}
