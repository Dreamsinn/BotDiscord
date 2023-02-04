import { CommandSchema } from '../../../commands/domain/interfaces/commandSchema';
import { Schema } from '../domain/schemaEntity';
import { SchemaService } from '../infrastructure/schemaService';

export class CreateSchema {
    private schemaService: SchemaService;
    constructor(schemaService: SchemaService) {
        this.schemaService = schemaService;
    }

    async call(commandSchemaList: CommandSchema[]): Promise<Schema[]> {
        const schemas: Partial<Schema>[] = commandSchemaList.map((commandSchema: CommandSchema) => {
            const schema: Partial<Schema> = {
                name: commandSchema.name,
                aliases: String(commandSchema.aliases),
                category: commandSchema.category,
                adminOnly: commandSchema.adminOnly,
                coolDown: commandSchema.coolDown,
                description: commandSchema.description,
            };
            return schema;
        });

        return this.schemaService.Create(schemas);
    }
}
