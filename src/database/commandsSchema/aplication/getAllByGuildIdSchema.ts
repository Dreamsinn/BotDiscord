import { Schema } from '../domain/schemaEntity';
import { SchemaService } from '../infrastructure/schemaService';

export class GetAllSchemasByGuildId {
    constructor(private schemaService: SchemaService) {}

    async call(guildId: string): Promise<Schema[]> {
        return this.schemaService.getAllByGuildId(guildId);
    }
}
