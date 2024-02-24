import { DiscordServer } from '../domain/discordServerEntity';
import { ServerDTO } from '../domain/serverDTO';
import { ServerService } from '../infrastructure/serverService';

export class GetAllServers {
  constructor(private serverService: ServerService) {}

  async call(): Promise<ServerDTO[]> {
    const serverList = await this.serverService.getAll();

    const serverDTOList: ServerDTO[] = serverList.map((rawServer: DiscordServer) => {
      return new ServerDTO(rawServer);
    });

    return serverDTOList;
  }
}
