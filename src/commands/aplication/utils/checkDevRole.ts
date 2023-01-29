import { Message } from 'discord.js';

export class CheckDevRole {
    public call(event: Message): boolean {
        if (
            event.member &&
            event.member.roles.cache.some((role) => role.name === process.env.ADMIN_ROL)
        ) {
            return true;
        }
        console.log({
            username: event.author.username,
            nickname: event.member?.nickname,
            error: 'No Admin Rol',
        });
        return false;
    }
}
