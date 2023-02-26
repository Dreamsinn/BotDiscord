/* eslint-disable arrow-body-style */
import { DataSource } from 'typeorm';
import { CommandsNameEnum } from '../../../commands/domain/enums/commandNamesEnum';
import { CommandsCategoryEnum } from '../../../commands/domain/enums/commandsCategoryEnum';
import { UpdateSchemaProps } from '../../commandsSchema/domain/interfaces/updateShcemaProps';
import { Schema } from '../../commandsSchema/domain/schemaEntity';
import { ConnectionHandler } from '../../connectionHandler';
import { DatabaseConnectionMock } from '../dataSourceMock';
import { commandsSchemasListMock } from './__mocks__/commandsSchemasListMock';
import { commandDictionaryMock } from './__mocks__/schemaDictionayMock';

describe('Schema Test', () => {
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

    const guildId = '12341234';

    let createdAt: Date;

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
        const schemaList = commandsSchemasListMock.slice(0, -1);
        const response = await databaseMock.schema.create(schemaList, guildId);

        createdAt = response[0].updatedAt;

        expect(response instanceof Array).toBe(true);
        expect(response[0] instanceof Schema).toBe(true);
        expect(response.length).toBe(schemaList.length);
        expect(response[0].guildId).toBe(guildId);
        expect(response[0].aliases).toEqual('schema,list');
        expect(response[0].category).toBe(CommandsCategoryEnum.MUSIC);
        expect(response[0].updatedAt.getTime() === response[5].updatedAt.getTime()).toBe(true);
    });

    it('CreateSchema, receiving only one CommandSchema', async () => {
        const schema = commandsSchemasListMock.slice(-1)[0];
        const response = await databaseMock.schema.create(schema, guildId);

        expect(response instanceof Array).toBe(true);
        expect(response[0] instanceof Schema).toBe(true);
        expect(response.length).toBe(1);
    });

    it('GetAllSchemasByGuildId, receiving an existing guild id', async () => {
        const response = await databaseMock.schema.getAllByGuildId(guildId);

        expect(response instanceof Array).toBe(true);
        expect(response[0] instanceof Schema).toBe(true);
        expect(response.length).toBe(commandsSchemasListMock.length);
        expect(response[0].guildId).toBe(guildId);
        expect(response[0].aliases).toEqual('schema,list');
        expect(response[0].category).toBe(CommandsCategoryEnum.MUSIC);
    });

    it('GetAllSchemasByGuildId, receiving non existing guild id', async () => {
        const response = await databaseMock.schema.getAllByGuildId('1234');

        expect(response).toEqual([]);
    });

    it('UpdateSchema', async () => {
        commandDictionaryMock[CommandsNameEnum.DiceCommand].coolDown = 555;
        commandDictionaryMock[CommandsNameEnum.DiceCommand].adminOnly = false;
        commandDictionaryMock[CommandsNameEnum.ClearPlaylistCommand].coolDown = 12345;
        commandDictionaryMock[CommandsNameEnum.ClearPlaylistCommand].adminOnly = true;

        const updateProps: UpdateSchemaProps = {
            modifiedsSchemaList: [CommandsNameEnum.DiceCommand, CommandsNameEnum.ClearPlaylistCommand],
            schemaDictionary: commandDictionaryMock,
            guildId: guildId,
            userId: 'Testing user',
        };

        const response = await databaseMock.schema.update(updateProps);

        expect(response instanceof Array).toBe(true);
        expect(response[0] instanceof Schema).toBe(true);
        expect(response.length).toBe(2);
        expect(response[0].command).toBe(CommandsNameEnum.DiceCommand);
        expect(response[0].coolDown).toBe(555);
        expect(response[1].adminOnly).toBe(true);
        expect(response[1].updatedBy).toBe(updateProps.userId);
        expect(response[0].updatedAt.getTime() !== createdAt.getTime()).toBe(true);
    });
});
