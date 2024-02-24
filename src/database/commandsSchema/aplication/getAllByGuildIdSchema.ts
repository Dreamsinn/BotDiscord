import { SchemaDTO } from '../domain/schemaDTO';
import { Schema } from '../domain/schemaEntity';
import { SchemaService } from '../infrastructure/schemaService';

export class GetAllSchemasByGuildId {
  constructor(private schemaService: SchemaService) {}

  async call(guildId: string): Promise<SchemaDTO[]> {
    const schemaList: Schema[] = await this.schemaService.getAllByGuildId(guildId);

    return schemaList.map((schema: Schema) => {
      return new SchemaDTO(schema);
    });
  }
}
