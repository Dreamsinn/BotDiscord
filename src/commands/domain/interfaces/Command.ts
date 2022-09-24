import { Message } from 'discord.js';
import { UsersUsingACommand } from '../../aplication/utils/usersUsingACommand';

export abstract class Command {
    abstract call(event: Message, userUsingCommand: UsersUsingACommand);
}
