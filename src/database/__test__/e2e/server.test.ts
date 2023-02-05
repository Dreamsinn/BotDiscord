/* eslint-disable arrow-body-style */
import * as dotenv from 'dotenv';
import { DataSource } from 'typeorm';
import { CreateServer } from '../../server/aplication/createServer';
import { GetAllServers } from '../../server/aplication/getAllServers';
import { DiscordServer } from '../../server/domain/discordServerEntity';
import { ServerService } from '../../server/infrastructure/serverService';

dotenv.config();

describe('Sever Test', () => {
    const dataSource = new DataSource({
        type: 'sqlite',
        database: ':memory:',
        synchronize: true,
        logging: false,
        entities: [DiscordServer],
        subscribers: [],
        migrations: [],
    });

    const guildId = '12341234';
    const guildName = 'Test Guild Name';
    let service: ServerService;

    beforeAll(async () => {
        await dataSource.initialize().catch((err) => {
            console.error('Error during testing Data Source initialization', err);
        });

        service = new ServerService(dataSource);
    });
    afterAll(async () => {
        await dataSource.destroy();
    });

    it('CreateServer', async () => {
        const response = await new CreateServer(service).call(guildId, guildName);

        expect(response instanceof DiscordServer).toBe(true);
        expect(response.id).toEqual(guildId);
        expect(response.name).toEqual(guildName);
        expect(response.prefix).toEqual(process.env.PREFIX);
        expect(response.adminRole).toEqual(process.env.ADMIN_ROL);
        expect(response.playList).toBe(null);
        expect(response.blackList).toBe(null);
        expect(response.createdAt instanceof Date).toBe(true);
        expect(String(response.createdAt) === String(response.updatedAt)).toBe(true);
        expect(response.updatedBy).toBe(null);
    });

    it('GetAllServers', async () => {
        const response = await new GetAllServers(service).call();

        expect(response![0]).not.toBe(undefined);
        expect(response![0] instanceof DiscordServer).toBe(true);
        expect(response?.length).toBe(1);
    });
});
