import { SchemaService } from './commandsSchema/infrastructure/schemaService';
import { SchemaController } from './commandsSchema/schemaController';
import { DatabaseConnection } from './dataSource';
import { PlaylistService } from './playlist/infrastructure/playlistService';
import { PlaylistController } from './playlist/playlistController';
import { ServerService } from './server/infrastructure/serverService';
import { ServerController } from './server/serverController';
import { AppDataSource } from './shared/domain/interface/appDataSource';
import { SongService } from './song/infrastructure/songService';
import { SongController } from './song/songController';

export class ConnectionHandler {
    public schema: SchemaController;
    public server: ServerController;
    public song: SongController;
    public playlist: PlaylistController;

    constructor(appDataSource: AppDataSource) {
        const dataSource = appDataSource.getDataSource();
        const schemaService = new SchemaService(dataSource);
        const serverService = new ServerService(dataSource);
        const songService = new SongService(dataSource);
        const playlistService = new PlaylistService(dataSource);

        this.schema = new SchemaController(schemaService);
        this.server = new ServerController(serverService);
        this.song = new SongController(songService);
        this.playlist = new PlaylistController(playlistService);
    }
}

const Database = new ConnectionHandler(new DatabaseConnection());
export default Database;
