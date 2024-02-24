import { DataSource } from 'typeorm';
import { AppDataSource } from '../shared/domain/interface/appDataSource';

export class DatabaseConnectionMock extends AppDataSource {
  constructor(dataSource: DataSource) {
    super();
    this.dataSource = dataSource;
  }
}
