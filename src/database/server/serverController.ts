import { CreateServer } from './aplication/createServer';
import { DiscordServer } from './domain/discordServerEntity';
import { ServerService } from './infrastructure/serverService';

export class ServerController {
    private createUseCase: CreateServer;

    constructor(serverService: ServerService) {
        this.createUseCase = new CreateServer(serverService);
    }

    public create(serverId: string, serverName: string): Promise<DiscordServer> {
        return this.createUseCase.call(serverId, serverName);
    }
}
