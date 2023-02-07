import { DiscordServer } from '../domain/discordServerEntity';
import { ServerService } from '../infrastructure/serverService';

export class GetServerById {
    private serverService: ServerService;
    constructor(serverService: ServerService) {
        this.serverService = serverService;
    }

    public async call(serverId: string): Promise<DiscordServer | null> {
        return await this.serverService.getById(serverId);
    }
}
