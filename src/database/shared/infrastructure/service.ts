import { DataSource } from 'typeorm';

export abstract class Service {
  protected dataSource: DataSource;
  constructor(dataSource: DataSource) {
    this.dataSource = dataSource;
  }
}
