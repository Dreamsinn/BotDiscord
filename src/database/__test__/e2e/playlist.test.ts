import { DataSource } from 'typeorm';
import { ConnectionHandler } from '../../connectionHandler';
import { CreatePlaylistProps } from '../../playlist/domain/interfaces/createPlaylistProps';
import { PlaylistDTO } from '../../playlist/domain/playlistDTO';
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

        if (!(response instanceof PlaylistDTO)) {
            // in theory should not go this way
            forceJestError('Playlist', ErrorEnum);
        } else {
            expect(response).toBeInstanceOf(PlaylistDTO);
            expect(response.privatePl).toBe(playlist.privatePl);
            expect(response.songsId).toEqual(playlist.songsId);
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

        expect(response).toBeInstanceOf(PlaylistDTO);
        expect(response?.songsId).toEqual(['test id 1', 'test id 2', 'test id 3', 'test id 4']);
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

        if (!(response instanceof PlaylistDTO)) {
            // in theory should not go this way
            forceJestError('Playlist', ErrorEnum);
        } else {
            expect(response).toBeInstanceOf(PlaylistDTO);
            expect(playlist?.updatedAt.getTime() === response.updatedAt.getTime()).toBe(false);
            expect(response.songsId).toEqual(updateData.songsId);
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

    it('GetPlaylistByAuthor', async () => {
        const response = await databaseMock.playlist.getByAuthor(author);

        expect(response instanceof Array).toBe(true);
        expect(response[0]).toBeInstanceOf(PlaylistDTO);
        expect(response.length).toBe(2);
    });

    it('GetPlaylistByAuthor with nonexistent author', async () => {
        const response = await databaseMock.playlist.getByAuthor(author + 1);

        expect(response instanceof Array).toBe(true);
        expect(response.length).toBe(0);
    });

    it('DeletePlaylist', async () => {
        const playlist = await databaseMock.playlist.getByAuthorAndName(author, 'new Name');

        await databaseMock.playlist.delete(playlist!.id);

        const deletedPlaylist = await databaseMock.playlist.getByAuthorAndName(author, 'new Name');

        expect(deletedPlaylist).toBe(null);
    });

    it('DeletePlaylist, with nonexistent id', async () => {
        const resposne = await databaseMock.playlist.delete('1111');

        expect(resposne).toBe(ErrorEnum.NotFound);
    });
});
