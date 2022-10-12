import { Message } from 'discord.js';

export class CheckAdminRole {
    public call(event: Message) {
        if (event.member.roles.cache.some((role) => role.name === process.env.ADMIN_ROL)) {
            return true;
        }
        return false;
    }
}
