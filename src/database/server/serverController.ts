import { CreateServer } from './aplication/createServer';
import { GetAllServers } from './aplication/getAllServers';
import { DiscordServer } from './domain/discordServerEntity';
import { ServerService } from './infrastructure/serverService';

export class ServerController {
    private createServer: CreateServer;
    private getAllServers: GetAllServers;

    constructor(serverService: ServerService) {
        this.createServer = new CreateServer(serverService);
        this.getAllServers = new GetAllServers(serverService);
    }

    public create(serverId: string, serverName: string): Promise<DiscordServer> {
        return this.createServer.call(serverId, serverName);
    }

    public getAll(): Promise<DiscordServer[] | null> {
        return this.getAllServers.call();
    }
}
