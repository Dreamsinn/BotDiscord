import { DataSource } from 'typeorm';
import AppDataSource from '../../dataSource';

export abstract class Service {
    protected dataSource: DataSource = AppDataSource.getDataSource();
}
