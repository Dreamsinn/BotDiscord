/* eslint-disable arrow-body-style */
import * as dotenv from 'dotenv';
import { DataSource } from 'typeorm';
import { CommandsNameEnum } from '../../../commands/domain/enums/commandNamesEnum';
import { CommandsCategoryEnum } from '../../../commands/domain/enums/commandsCategoryEnum';
import { CommandSchema } from '../../../commands/domain/interfaces/commandSchema';
import { Schema } from '../../commandsSchema/domain/schemaEntity';
import { ConnectionHandler } from '../../connectionHandler';
import { DatabaseConnectionMock } from '../dataSourceMock';

dotenv.config();

describe('Sever Test', () => {
    const dataSource = new DataSource({
        type: 'sqlite',
        database: ':memory:',
        synchronize: true,
        logging: false,
        entities: [Schema],
        subscribers: [],
        migrations: [],
    });

    let databaseMock: ConnectionHandler;

    const schemaList: CommandSchema[] = [
        {
            name: 'Test schma 1',
            aliases: ['schema', 'list'],
            coolDown: 0,
            adminOnly: false,
            description: 'long description',
            category: CommandsCategoryEnum.MUSIC,
            command: CommandsNameEnum.ClearPlaylistCommand,
        },
        {
            name: 'Test schma 2',
            aliases: ['schema 2', 'commandSchema'],
            coolDown: 100,
            adminOnly: true,
            description: 'long description 2',
            category: CommandsCategoryEnum.PREFIX,
            command: CommandsNameEnum.DiceCommand,
        },
    ];

    const guildId = '12341234';

    beforeAll(async () => {
        await dataSource.initialize().catch((err) => {
            console.error('Error during testing Data Source initialization', err);
        });

        databaseMock = new ConnectionHandler(new DatabaseConnectionMock(dataSource));
    });

    afterAll(async () => {
        await dataSource.destroy();
    });

    it('CreateSchema, receiving an array of CommandSchema', async () => {
        const response = await databaseMock.schema.create(schemaList, guildId);

        expect(response instanceof Array).toBe(true);
        expect(response[0] instanceof Schema).toBe(true);
        expect(response.length).toBe(2);
        expect(response[0].guildId).toBe(guildId);
        expect(response[0].aliases).toEqual('schema,list');
        expect(response[0].category).toBe(CommandsCategoryEnum.MUSIC);
    });

    it('CreateSchema, receiving only one CommandSchema', async () => {
        const schema = schemaList[0];
        const response = await databaseMock.schema.create(schema, guildId);

        expect(response instanceof Array).toBe(true);
        expect(response[0] instanceof Schema).toBe(true);
        expect(response.length).toBe(1);
    });
});
