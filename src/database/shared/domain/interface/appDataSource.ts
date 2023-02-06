import { DataSource } from 'typeorm';

export abstract class AppDataSource {
    protected dataSource: DataSource;

    public getDataSource() {
        return this.dataSource;
    }
}
