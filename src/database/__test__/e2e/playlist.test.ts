import { DataSource } from 'typeorm';
import { ConnectionHandler } from '../../connectionHandler';
import { CreatePlaylistProps } from '../../playlist/domain/interfaces/createPlaylistProps';
import { Playlist } from '../../playlist/domain/playlistEntity';
import { ErrorEnum } from '../../shared/domain/enums/ErrorEnum';
import { DatabaseConnectionMock } from '../dataSourceMock';
import { forceJestError } from '../forceJestError';

describe('Playlist Test', () => {
    const dataSource = new DataSource({
        type: 'sqlite',
        database: ':memory:',
        synchronize: true,
        logging: false,
        entities: [Playlist],
        subscribers: [],
        migrations: [],
    });

    let databaseMock: ConnectionHandler;

    const author = 'test user 1';
    const name = 'TestPlaylist';

    beforeAll(async () => {
        await dataSource.initialize().catch((err) => {
            console.error('Error during testing Data Source initialization', err);
        });

        databaseMock = new ConnectionHandler(new DatabaseConnectionMock(dataSource));
    });
    afterAll(async () => {
        await dataSource.destroy();
    });

    it('CreatePlaylist', async () => {
        const playlist: CreatePlaylistProps = {
            songsId: ['test id 1', 'test id 2', 'test id 3', 'test id 4'],
            author,
            privatePl: true,
            name,
            createdBy: author,
        };
        const response = await databaseMock.playlist.create(playlist);

        if (!(response instanceof Playlist)) {
            // in theory should not go this way
            forceJestError('Playlist', ErrorEnum);
        } else {
            expect(response instanceof Playlist).toBe(true);
            expect(response.privatePl).toBe(playlist.privatePl);
            expect(response.songsId).toBe(String(playlist.songsId));
            expect(response.author === response.createdBy).toBe(true);
        }
    });

    it('CreatePlaylist with existent [author, name]', async () => {
        const playlist: CreatePlaylistProps = {
            songsId: ['test id'],
            author,
            privatePl: true,
            name,
            createdBy: author,
        };
        const response = await databaseMock.playlist.create(playlist);

        expect(response).toBe(ErrorEnum.BadRequest);
    });

    it('GetPlaylistByAuthorAndName', async () => {
        const response = await databaseMock.playlist.getByAuthorAndName(author, name);

        expect(response instanceof Playlist).toBe(true);
        expect(response?.songsId).toBe(String(['test id 1', 'test id 2', 'test id 3', 'test id 4']));
        expect(response?.privatePl).toBe(true);
    });

    it('GetPlaylistByAuthorAndName with nonexistent [author, name]', async () => {
        const response = await databaseMock.playlist.getByAuthorAndName(author, name + 1);

        expect(response).toBe(null);
    });

    it('UpdatePlaylist', async () => {
        const playlist = await databaseMock.playlist.getByAuthorAndName(author, name);

        const updateData = {
            id: playlist!.id,
            updatedBy: 'me',
            name: 'new Name',
            songsId: ['songId', 'songId2', 'songId3'],
        };
        const response = await databaseMock.playlist.update(updateData);

        if (!(response instanceof Playlist)) {
            // in theory should not go this way
            forceJestError('Playlist', ErrorEnum);
        } else {
            expect(response instanceof Playlist).toBe(true);
            expect(playlist?.updatedAt.getTime() === response.updatedAt.getTime()).toBe(false);
            expect(response.songsId).toBe(String(updateData.songsId));
            expect(response.name).toBe(updateData.name);
            expect(response.updatedBy).toBe(updateData.updatedBy);
        }
    });

    it('UpdatePlaylist without name and songsID', async () => {
        const response = await databaseMock.playlist.update({
            id: '1',
            updatedBy: author,
        });

        expect(response).toBe(ErrorEnum.BadRequest);
    });

    it('UpdatePlaylist with existing [name, author]', async () => {
        await databaseMock.playlist.create({
            songsId: ['test id'],
            author,
            privatePl: true,
            name: 'name 2',
            createdBy: author,
        });

        const response = await databaseMock.playlist.update({
            id: '1',
            updatedBy: author,
            name: 'name 2',
        });

        expect(response).toBe(ErrorEnum.BadRequest);
    });

    it('UpdatePlaylist with nonexisting platlist id', async () => {
        const response = await databaseMock.playlist.update({
            id: '1234',
            updatedBy: 'me',
            name: 'testing error',
            songsId: ['songId', 'songId2'],
        });

        expect(response).toBe(ErrorEnum.NotFound);
    });
});
