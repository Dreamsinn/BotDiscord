import { UpdateResult } from 'typeorm';
import { Service } from '../../shared/infrastructure/service';
import { DiscordServer } from '../domain/discordServerEntity';
import { NewServer } from '../domain/interfaces/newServer';
import { UpdateServer } from '../domain/interfaces/updateServer';

export class ServerService extends Service {
  private serverRepository = this.dataSource.getRepository(DiscordServer);

  public async create(discordServer: NewServer): Promise<DiscordServer> {
    const server = this.serverRepository.create(discordServer);
    return this.serverRepository.save(server);
  }

  public async getAll(): Promise<DiscordServer[]> {
    return this.serverRepository.find();
  }

  public async getById(serverId: string): Promise<DiscordServer | null> {
    return this.serverRepository.findOneBy({ id: serverId });
  }

  public async update(serverId: string, update: UpdateServer): Promise<UpdateResult> {
    return this.serverRepository.update(serverId, update);
  }
}
