import { CommandSchema } from '../../commands/domain/interfaces/commandSchema';
import { CreateSchema } from './aplication/createSchema';
import { GetAllSchemasByGuildId } from './aplication/getAllByGuildIdSchema';
import { Schema } from './domain/schemaEntity';
import { SchemaService } from './infrastructure/schemaService';

export class SchemaController {
    private createSchema: CreateSchema;
    private getAllSchemasByGuildId: GetAllSchemasByGuildId;

    constructor(schemaService: SchemaService) {
        this.createSchema = new CreateSchema(schemaService);
        this.getAllSchemasByGuildId = new GetAllSchemasByGuildId(schemaService);
    }

    public create(
        commandSchemaList: CommandSchema | CommandSchema[],
        guildId: string,
    ): Promise<Schema[]> {
        return this.createSchema.call(commandSchemaList, guildId);
    }

    public getAllByGuildId(guildId: string) {
        return this.getAllSchemasByGuildId.call(guildId);
    }
}
