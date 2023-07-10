import { Languages } from '../../../languages/languageService';
import { typeIsLanguage } from '../../../languages/utils/typeIsLanguage';
import { DiscordServer } from './discordServerEntity';

export class ServerDTO {
    readonly id: string;
    readonly name: string;
    readonly prefix: string;
    readonly adminRole: string;
    readonly blackList: string[];
    readonly language: Languages;
    readonly createdAt: Date;
    readonly updatedAt: Date;
    readonly updatedBy: string | null;

    constructor(server: DiscordServer) {
        let verifiedLanguage: Languages = 'en';

        if (typeIsLanguage(server.language)) {
            verifiedLanguage = server.language;
        }

        this.id = server.id;
        this.name = server.name;
        this.prefix = server.prefix;
        this.adminRole = server.adminRole;
        this.blackList = server.blackList ? server.blackList.split(',') : [];
        this.language = verifiedLanguage;
        this.createdAt = server.createdAt;
        this.updatedAt = server.updatedAt;
        this.updatedBy = server.updatedBy;
    }
}
