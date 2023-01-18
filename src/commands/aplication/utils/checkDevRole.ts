import { Message } from 'discord.js';

export class CheckDevRole {
    public call(event: Message): boolean {
        if (event.member.roles.cache.some((role) => role.name === process.env.ADMIN_ROL)) {
            return true;
        }
        return false;
    }
}
