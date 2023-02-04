import { DataSource } from 'typeorm';
import { Schema } from './commandsSchema/domain/schemaEntity';

class AppDataSource {
    private dataSource: DataSource;

    public async CreateDataSource() {
        if (this.dataSource) {
            return;
        }

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
    }

    public getDataSource() {
        return this.dataSource;
    }
}

export default new AppDataSource();
