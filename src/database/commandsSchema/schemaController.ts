import { CommandSchema } from '../../commands/domain/interfaces/commandSchema';
import { CreateSchema } from './aplication/createSchema';
import { GetAllSchemasByGuildId } from './aplication/getAllByGuildIdSchema';
import { UpdateSchema } from './aplication/updateSchema';
import { UpdateSchemaProps } from './domain/interfaces/updateShcemaProps';
import { Schema } from './domain/schemaEntity';
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
    ): Promise<Schema[]> {
        return this.createSchema.call(commandSchemaList, guildId);
    }

    public getAllByGuildId(guildId: string): Promise<Schema[]> {
        return this.getAllSchemasByGuildId.call(guildId);
    }

    public update(props: UpdateSchemaProps): Promise<Schema[]> {
        return this.updateSchema.call(props);
    }
}
