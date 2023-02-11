import { DiscordServer } from '../domain/discordServerEntity';
import { NewServer } from '../domain/interfaces/newServer';
import { ServerService } from '../infrastructure/serverService';

export class CreateServer {
    private serverService: ServerService;
    constructor(serverService: ServerService) {
        this.serverService = serverService;
    }

    async call(
        serverId: string,
        serverName: string,
        adminRoleId: string | undefined,
    ): Promise<DiscordServer> {
        const server: NewServer = {
            id: serverId,
            name: serverName,
            prefix: process.env.PREFIX!,
            adminRole: adminRoleId,
        };

        return this.serverService.create(server);
    }
}
