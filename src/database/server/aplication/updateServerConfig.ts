import { UpdateResult } from 'typeorm';
import { ErrorEnum } from '../../shared/domain/enums/ErrorEnum';
import { ServerConfig } from '../domain/interfaces/serverConfig';
import { UpdateServer } from '../domain/interfaces/updateServer';
import { ServerService } from '../infrastructure/serverService';

export class UpdateServerConfig {
    private serverService: ServerService;
    constructor(serverService: ServerService) {
        this.serverService = serverService;
    }

    public async call(
        serverId: string,
        userId: string,
        config: ServerConfig,
    ): Promise<UpdateResult | ErrorEnum> {
        if (!config.adminRole && !config.blackList && !config.prefix) {
            return ErrorEnum.BadRequest;
        }

        const server = await this.serverService.getById(serverId);
        if (!server) {
            return ErrorEnum.NotFound;
        }

        const update: UpdateServer = {
            updatedBy: userId,
            updatedAt: new Date(),
        };

        if (config.blackList) {
            update.blackList = String(config.blackList);
        }

        if (config.prefix) {
            update.prefix = config.prefix;
        }

        if (config.adminRole) {
            update.adminRole = config.adminRole;
        }

        return this.serverService.update(serverId, update);
    }
}
