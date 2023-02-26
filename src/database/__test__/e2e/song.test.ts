import * as dotenv from 'dotenv';
import { DataSource } from 'typeorm';
import { SongData } from '../../../commands/domain/interfaces/song';
import { ConnectionHandler } from '../../connectionHandler';
import { Song } from '../../song/domain/songEntity';
import { DatabaseConnectionMock } from '../dataSourceMock';

dotenv.config();

describe('Song Test', () => {
    const dataSource = new DataSource({
        type: 'sqlite',
        database: ':memory:',
        synchronize: true,
        logging: false,
        entities: [Song],
        subscribers: [],
        migrations: [],
    });

    let databaseMock: ConnectionHandler;

    const SongArray: SongData[] = [
        {
            songId: 'yutube id',
            songName: 'test Name song',
            duration: {
                hours: 0,
                minutes: 3,
                seconds: 50,
                string: '3m 50s',
            },
            thumbnails: 'imga link',
        },
        {
            songId: 'yutube id 2',
            songName: 'test Name song 2',
            duration: {
                hours: 1,
                minutes: 5,
                seconds: 10,
                string: '1h 5m 10s',
            },
            thumbnails: 'imga link 2',
        },
    ];

    beforeAll(async () => {
        await dataSource.initialize().catch((err) => {
            console.error('Error during testing Data Source initialization', err);
        });

        databaseMock = new ConnectionHandler(new DatabaseConnectionMock(dataSource));
    });
    afterAll(async () => {
        await dataSource.destroy();
    });

    it('CreateSong with a songArray', async () => {
        const response = await databaseMock.song.create(SongArray);
        console.log({ response });
        expect(response instanceof Array).toBe(true);
        expect(response[0] instanceof Song).toBe(true);
        expect(response.length).toBe(2);
        expect(response[0].YouTubeId).toBe(SongArray[0].songId);
        expect(response[1].name).toBe(SongArray[1].songName);
        expect(response[1].durationString).toBe(SongArray[1].duration.string);
    });

    it('CreateSong with only 1 song', async () => {
        const songData: SongData = {
            songId: 'yutube id 3',
            songName: 'test Name song 3',
            duration: {
                hours: 0,
                minutes: 0,
                seconds: 10,
                string: '10s',
            },
            thumbnails: 'imga link 3',
        };

        const response = await databaseMock.song.create(songData);
        console.log({ response });

        expect(response instanceof Array).toBe(true);
        expect(response[0] instanceof Song).toBe(true);
        expect(response.length).toBe(1);
    });

    // it('CreateSong with alredy existing YouTubeId', async () => {
    //     const response = await databaseMock.song.create(SongArray)
    //     console.log({ response })

    // });
});
