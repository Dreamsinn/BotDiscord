import { DiscordServer } from '../domain/discordServerEntity';
import { NewServer } from '../domain/interfaces/newServer';
import { ServerService } from '../infrastructure/serverService';

export class CreateServer {
    private serverService: ServerService;
    constructor(serverService: ServerService) {
        this.serverService = serverService;
    }

    async call(serverId: string, serverName: string): Promise<DiscordServer> {
        const server: NewServer = {
            id: serverId,
            name: serverName,
            prefix: process.env.PREFIX!,
            adminRole: process.env.ADMIN_ROL!,
        };

        return this.serverService.create(server);
    }
}
