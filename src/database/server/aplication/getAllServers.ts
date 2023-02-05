import { DiscordServer } from '../domain/discordServerEntity';
import { ServerService } from '../infrastructure/serverService';

export class GetAllServers {
    constructor(private serverService: ServerService) {}

    async call(): Promise<DiscordServer[] | null> {
        return this.serverService.GetAll();
    }
}
