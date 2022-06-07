import { Message } from 'discord.js';

export abstract class Command {
    abstract call(event: Message);
}
