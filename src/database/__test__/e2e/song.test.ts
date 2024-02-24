import * as dotenv from 'dotenv';
import { DataSource } from 'typeorm';
import { SongData } from '../../../commands/domain/interfaces/song';
import { ConnectionHandler } from '../../connectionHandler';
import { SongDTO } from '../../song/domain/SongDTO';
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
      songId: 'yuotube id',
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
      songId: 'yuotube id 2',
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
    await dataSource.initialize().catch(err => {
      console.error('Error during testing Data Source initialization', err);
    });

    databaseMock = new ConnectionHandler(new DatabaseConnectionMock(dataSource));
  });
  afterAll(async () => {
    await dataSource.destroy();
  });

  it('CreateSong with a songArray', async () => {
    const response = await databaseMock.song.create(SongArray);

    expect(response instanceof Array).toBe(true);
    expect(response[0]).toBeInstanceOf(SongDTO);
    expect(response.length).toBe(2);
    expect(response[0].id).toBe(SongArray[0].songId);
    expect(response[1].name).toBe(SongArray[1].songName);
    expect(response[1].duration.string).toBe(SongArray[1].duration.string);
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

    expect(response instanceof Array).toBe(true);
    expect(response[0]).toBeInstanceOf(SongDTO);
    expect(response.length).toBe(1);
    expect(response[0].id).toBe(songData.songId);
  });

  it('CreateSong with alredy existing YouTubeId', async () => {
    const response = await databaseMock.song.create(SongArray);

    expect(response instanceof Array).toBe(true);
    expect(response.length).toBe(0);
  });

  it('GetSongById with a youbute id array', async () => {
    const response = await databaseMock.song.getById([
      SongArray[0].songId,
      SongArray[1].songId,
    ]);

    expect(response instanceof Array).toBe(true);
    expect(response[0]).toBeInstanceOf(SongDTO);
    expect(response.length).toBe(2);
  });

  it('GetSongById with 1 only id', async () => {
    const response = await databaseMock.song.getById(SongArray[0].songId);

    expect(response instanceof Array).toBe(true);
    expect(response[0]).toBeInstanceOf(SongDTO);
    expect(response.length).toBe(1);
  });

  it('GetSongById with nonexistent id', async () => {
    const response = await databaseMock.song.getById('12345');

    expect(response instanceof Array).toBe(true);
    expect(response.length).toBe(0);
  });
});
