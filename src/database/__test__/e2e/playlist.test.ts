import { DataSource } from 'typeorm';
import { ConnectionHandler } from '../../connectionHandler';
import { CreatePlaylistProps } from '../../playlist/domain/interfaces/createPlaylistProps';
import { Playlist } from '../../playlist/domain/playlistEntity';
import { ErrorEnum } from '../../shared/domain/enums/ErrorEnum';
import { DatabaseConnectionMock } from '../dataSourceMock';

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
        };
        const response = await databaseMock.playlist.create(playlist);

        if (!(response instanceof Playlist)) {
            throw new Error(
                'expect(' +
                    '\x1b[31m' +
                    'received' +
                    '\x1b[37m' +
                    ').toBe(' +
                    '\x1b[32m' +
                    'expected' +
                    '\x1b[37m' +
                    ')\n\n' +
                    'Expected: ' +
                    '\x1b[32m' +
                    'Playlist \n\x1b[37m' +
                    'Received: ' +
                    '\x1b[31m' +
                    `${ErrorEnum.BadRequest}`,
            );
        } else {
            expect(response instanceof Playlist).toBe(true);
            expect(response.privatePl).toBe(playlist.privatePl);
            expect(response.songsId).toBe(String(playlist.songsId));
        }
    });

    it('CreatePlaylist with existent [author, name]', async () => {
        const playlist: CreatePlaylistProps = {
            songsId: ['test id'],
            author,
            privatePl: true,
            name,
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
});
