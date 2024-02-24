import { Message } from 'discord.js';

export interface IsDisplayActive {
  active: boolean;
  event: Message | undefined;
}
