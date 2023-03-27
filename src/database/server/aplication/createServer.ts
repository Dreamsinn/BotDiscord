import { Languages, languagesArray } from '../../../languages/languageService';
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
        language: string | undefined,
    ): Promise<DiscordServer> {
        let verifiedLanguage: Languages = 'en';

        languagesArray.forEach((values: Languages) => {
            if (language === values) {
                verifiedLanguage = language;
            }
        });

        const server: NewServer = {
            id: serverId,
            name: serverName,
            prefix: process.env.PREFIX!,
            adminRole: adminRoleId,
            language: verifiedLanguage,
        };

        return this.serverService.create(server);
    }
}
