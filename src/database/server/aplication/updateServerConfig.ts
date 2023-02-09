import { UpdateResult } from 'typeorm';
import { ErrorEnum } from '../../shared/domain/enums/ErrorEnum';
import { ServerConfigOptions } from '../domain/interfaces/serverConfig';
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
        config: ServerConfigOptions,
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
            update.blackList = this.mapBlackList(server.blackList, config.blackList);
        }

        if (config.prefix) {
            update.prefix = config.prefix;
        }

        if (config.adminRole) {
            update.adminRole = config.adminRole;
        }

        return this.serverService.update(serverId, update);
    }

    private mapBlackList(serverBlackList: string | null, updateBlackList: string[]): string {
        if (!serverBlackList) {
            return String(updateBlackList);
        }
        const serverBlackListArray = serverBlackList.split(',');
        serverBlackListArray.push(...updateBlackList);

        return String(serverBlackListArray);
    }
}
