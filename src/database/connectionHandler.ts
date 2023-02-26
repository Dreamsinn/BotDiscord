import { SchemaService } from './commandsSchema/infrastructure/schemaService';
import { SchemaController } from './commandsSchema/schemaController';
import { DatabaseConnection } from './dataSource';
import { ServerService } from './server/infrastructure/serverService';
import { ServerController } from './server/serverController';
import { AppDataSource } from './shared/domain/interface/appDataSource';
import { SongService } from './song/infrastructure/songService';
import { SongController } from './song/songController';

export class ConnectionHandler {
    public schema: SchemaController;
    public server: ServerController;
    public song: SongController;

    constructor(appDataSource: AppDataSource) {
        const dataSource = appDataSource.getDataSource();
        const schemaService = new SchemaService(dataSource);
        const serverService = new ServerService(dataSource);
        const songService = new SongService(dataSource);

        this.schema = new SchemaController(schemaService);
        this.server = new ServerController(serverService);
        this.song = new SongController(songService);
    }
}

const Database = new ConnectionHandler(new DatabaseConnection());
export default Database;
