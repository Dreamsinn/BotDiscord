import { UpdateResult } from 'typeorm';
import { ErrorEnum } from '../shared/domain/enums/ErrorEnum';
import { CreateServer } from './aplication/createServer';
import { GetAllServers } from './aplication/getAllServers';
import { GetServerById } from './aplication/getServerById';
import { UpdateServerConfig } from './aplication/updateServerConfig';
import { ServerConfig } from './domain/interfaces/serverConfig';
import { ServerDTO } from './domain/serverDTO';
import { ServerService } from './infrastructure/serverService';

export class ServerController {
    private createServer: CreateServer;
    private getAllServers: GetAllServers;
    private getServerById: GetServerById;
    private updateServerConfig: UpdateServerConfig;

    constructor(serverService: ServerService) {
        this.createServer = new CreateServer(serverService);
        this.getAllServers = new GetAllServers(serverService);
        this.getServerById = new GetServerById(serverService);
        this.updateServerConfig = new UpdateServerConfig(serverService);
    }

    public create(
        serverId: string,
        serverName: string,
        adminRoleId: string | undefined,
        language: string | undefined,
    ): Promise<ServerDTO> {
        return this.createServer.call(serverId, serverName, adminRoleId, language);
    }

    public getAll(): Promise<ServerDTO[]> {
        return this.getAllServers.call();
    }

    public getById(serverId: string): Promise<ServerDTO | null> {
        return this.getServerById.call(serverId);
    }

    public updateConfig(
        serverId: string,
        userId: string,
        config: ServerConfig,
    ): Promise<UpdateResult | ErrorEnum> {
        return this.updateServerConfig.call(serverId, userId, config);
    }
}
