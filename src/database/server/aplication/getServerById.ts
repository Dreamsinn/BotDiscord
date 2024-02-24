import { DiscordServer } from '../domain/discordServerEntity';
import { ServerDTO } from '../domain/serverDTO';
import { ServerService } from '../infrastructure/serverService';

export class GetServerById {
  private serverService: ServerService;
  constructor(serverService: ServerService) {
    this.serverService = serverService;
  }

  public async call(serverId: string): Promise<ServerDTO | null> {
    const server: DiscordServer | null = await this.serverService.getById(serverId);

    if (!server) {
      return server;
    }

    return new ServerDTO(server);
  }
}
