import { Message } from 'discord.js';

export class CheckDevRole {
    public call(event: Message) {
        if (event.member.roles.cache.some((role) => role.name === process.env.DEV_ROL)) {
            return true;
        }
        return false;
    }
}
