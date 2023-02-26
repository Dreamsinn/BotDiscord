import { DataSource } from 'typeorm';
import { Schema } from './commandsSchema/domain/schemaEntity';
import { Playlist } from './playlist/domain/playlistEntity';
import { DiscordServer } from './server/domain/discordServerEntity';
import { AppDataSource } from './shared/domain/interface/appDataSource';
import { Song } from './song/domain/songEntity';

export class DatabaseConnection extends AppDataSource {
    constructor() {
        super();
        const dataSource = new DataSource({
            type: 'sqlite',
            database: 'db.sqlite',
            synchronize: true,
            logging: true,
            entities: [Schema, DiscordServer, Song, Playlist],
            subscribers: [],
            migrations: [],
        });

        dataSource
            .initialize()
            .then(() => {
                console.log('Data Source has been initialized!');
            })
            .catch((err) => {
                console.error('Error during Data Source initialization', err);
            });

        this.dataSource = dataSource;
    }
}
