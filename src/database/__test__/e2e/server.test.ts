import * as dotenv from 'dotenv';
import { DataSource } from 'typeorm';
import { ConnectionHandler } from '../../connectionHandler';
import { DiscordServer } from '../../server/domain/discordServerEntity';
import { DatabaseConnectionMock } from '../dataSourceMock';

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

    let databaseMock: ConnectionHandler;

    const guildId = '12341234';
    const guildName = 'Test Guild Name';

    beforeAll(async () => {
        await dataSource.initialize().catch((err) => {
            console.error('Error during testing Data Source initialization', err);
        });

        databaseMock = new ConnectionHandler(new DatabaseConnectionMock(dataSource));
    });
    afterAll(async () => {
        await dataSource.destroy();
    });

    it('CreateServer', async () => {
        const response = await databaseMock.server.create(guildId, guildName);

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
        const response = await databaseMock.server.getAll();

        expect(response[0]).not.toBe(undefined);
        expect(response[0] instanceof DiscordServer).toBe(true);
        expect(response.length).toBe(1);
    });
});
