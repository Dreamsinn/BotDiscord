import { SchemaController } from './commandsSchema/schemaController';
import { AppDataSource } from './dataSource';

class DatabaseConnection {
    public schema: SchemaController;

    constructor(appDataSource: AppDataSource) {
        const dataSource = appDataSource.getDataSource();

        this.schema = new SchemaController(dataSource);
    }
}

export default new DatabaseConnection(new AppDataSource());
