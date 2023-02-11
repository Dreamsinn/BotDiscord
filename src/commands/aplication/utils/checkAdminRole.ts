import { Message, Role } from 'discord.js';

export class CheckAdminRole {
    public call(event: Message, adminRole: string): boolean {
        if (event.member && event.member.roles.cache.some((role: Role) => role.id === adminRole)) {
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
