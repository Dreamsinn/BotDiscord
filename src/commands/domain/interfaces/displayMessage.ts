import { Message, ThreadChannel } from 'discord.js';

export interface DisplayMessage {
    message: Message;
    thread: ThreadChannel;
}
