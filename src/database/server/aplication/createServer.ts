import { Languages } from '../../../languages/languageService';
import { typeIsLanguage } from '../../../languages/utils/typeIsLanguage';
import { NewServer } from '../domain/interfaces/newServer';
import { ServerDTO } from '../domain/serverDTO';
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
        language: string | undefined,
    ): Promise<ServerDTO> {
        let verifiedLanguage: Languages = 'en';

        if (language && typeIsLanguage(language)) {
            verifiedLanguage = language;
        }

        const server: NewServer = {
            id: serverId,
            name: serverName,
            prefix: process.env.PREFIX!,
            adminRole: adminRoleId,
            language: verifiedLanguage,
        };

        return new ServerDTO(await this.serverService.create(server));
    }
}
