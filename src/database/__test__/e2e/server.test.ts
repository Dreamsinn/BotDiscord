import * as dotenv from 'dotenv';
import { DataSource, UpdateResult } from 'typeorm';
import { ConnectionHandler } from '../../connectionHandler';
import { DiscordServer } from '../../server/domain/discordServerEntity';
import { ServerConfigOptions } from '../../server/domain/interfaces/serverConfig';
import { ErrorEnum } from '../../shared/domain/enums/ErrorEnum';
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

        expect(response).toBeInstanceOf(DiscordServer);
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
        expect(response[0]).toBeInstanceOf(DiscordServer);
        expect(response.length).toBe(1);
    });

    it('GetServerById', async () => {
        const response = await databaseMock.server.getById(guildId);

        expect(response).toBeInstanceOf(DiscordServer);
    });

    it('GetServerById with no existing id', async () => {
        const response = await databaseMock.server.getById('1234');

        expect(response).toBe(null);
    });

    it('UpdateServerConfig', async () => {
        const update: ServerConfigOptions = {
            adminRole: 'testAdminRole',
            blackList: ['testUserID', 'testUserID2', 'testUserID3'],
            prefix: '>>',
        };
        const userId = '123456';

        const response = await databaseMock.server.updateConfig(guildId, userId, update);
        const updatedServer = await databaseMock.server.getById(guildId);

        expect(response).toBeInstanceOf(UpdateResult);
        expect(updatedServer?.prefix).toEqual('>>');
        expect(updatedServer?.blackList).toEqual('testUserID,testUserID2,testUserID3');
        expect(updatedServer?.adminRole).toEqual('testAdminRole');
        expect(updatedServer?.updatedBy).toEqual(userId);
        expect(updatedServer?.createdAt.getTime() !== updatedServer?.updatedAt.getTime()).toBe(true);
    });

    it('UpdateServerConfig with voiden config boject', async () => {
        const update: ServerConfigOptions = {};
        const userId = '123456';

        const response = await databaseMock.server.updateConfig(guildId, userId, update);

        expect(response === ErrorEnum.BadRequest).toBe(true);
    });

    it('UpdateServerConfig with unexisten id', async () => {
        const update: ServerConfigOptions = {
            adminRole: 'testAdminRole',
            blackList: ['testUserID', 'testUserID2', 'testUserID3'],
            prefix: '>>',
        };

        const userId = '123456';

        const response = await databaseMock.server.updateConfig('guildId', userId, update);

        expect(response === ErrorEnum.NotFound).toBe(true);
    });
});
