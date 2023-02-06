import { Service } from '../../shared/infrastructure/Service';
import { DiscordServer } from '../domain/discordServerEntity';
import { NewServer } from '../domain/interfaces/newServer';

export class ServerService extends Service {
    private schemaRepository = this.dataSource.getRepository(DiscordServer);

    public async create(discordServer: NewServer): Promise<DiscordServer> {
        const server = this.schemaRepository.create(discordServer);
        return this.schemaRepository.save(server);
    }

    public async getAll(): Promise<DiscordServer[]> {
        return this.schemaRepository.find();
    }
}
