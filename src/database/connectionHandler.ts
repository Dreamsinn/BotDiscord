import { SchemaService } from './commandsSchema/infrastructure/schemaService';
import { SchemaController } from './commandsSchema/schemaController';
import { DatabaseConnection } from './dataSource';
import { ServerService } from './server/infrastructure/serverService';
import { ServerController } from './server/serverController';
import { AppDataSource } from './shared/domain/interface/appDataSource';

export class ConnectionHandler {
    public schema: SchemaController;
    public server: ServerController;

    constructor(appDataSource: AppDataSource) {
        const dataSource = appDataSource.getDataSource();
        const schemaService = new SchemaService(dataSource);
        const serverService = new ServerService(dataSource);

        this.schema = new SchemaController(schemaService);
        this.server = new ServerController(serverService);
    }
}

const Database = new ConnectionHandler(new DatabaseConnection());
export default Database;
