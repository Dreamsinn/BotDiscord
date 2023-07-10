import { CommandSchema } from '../../commands/domain/interfaces/commandSchema';
import { CreateSchema } from './aplication/createSchema';
import { GetAllSchemasByGuildId } from './aplication/getAllByGuildIdSchema';
import { UpdateSchema } from './aplication/updateSchema';
import { UpdateSchemaProps } from './domain/interfaces/updateShcemaProps';
import { SchemaDTO } from './domain/schemaDTO';
import { SchemaService } from './infrastructure/schemaService';

export class SchemaController {
    private createSchema: CreateSchema;
    private getAllSchemasByGuildId: GetAllSchemasByGuildId;
    private updateSchema: UpdateSchema;

    constructor(schemaService: SchemaService) {
        this.createSchema = new CreateSchema(schemaService);
        this.getAllSchemasByGuildId = new GetAllSchemasByGuildId(schemaService);
        this.updateSchema = new UpdateSchema(schemaService);
    }

    public create(
        commandSchemaList: CommandSchema | CommandSchema[],
        guildId: string,
    ): Promise<SchemaDTO[]> {
        return this.createSchema.call(commandSchemaList, guildId);
    }

    public getAllByGuildId(guildId: string): Promise<SchemaDTO[]> {
        return this.getAllSchemasByGuildId.call(guildId);
    }

    public update(props: UpdateSchemaProps): Promise<SchemaDTO[]> {
        return this.updateSchema.call(props);
    }
}
