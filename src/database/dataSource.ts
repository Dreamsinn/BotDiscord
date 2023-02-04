import { DataSource } from 'typeorm';
import { Schema } from './commandsSchema/domain/schemaEntity';

export class AppDataSource {
    private dataSource: DataSource;

    constructor() {
        const dataSource = new DataSource({
            type: 'sqlite',
            database: 'db.sqlite',
            synchronize: true,
            logging: true,
            entities: [Schema],
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

    public getDataSource() {
        return this.dataSource;
    }
}
