import { CommandSchema } from '../../../commands/domain/interfaces/commandSchema';
import { NewSchema } from '../domain/interfaces/newSchema';
import { SchemaDTO } from '../domain/schemaDTO';
import { Schema } from '../domain/schemaEntity';
import { SchemaService } from '../infrastructure/schemaService';

export class CreateSchema {
    private schemaService: SchemaService;
    constructor(schemaService: SchemaService) {
        this.schemaService = schemaService;
    }

    async call(commandSchema: CommandSchema | CommandSchema[], guildId: string): Promise<SchemaDTO[]> {
        let schemaList: NewSchema[];

        if (commandSchema instanceof Array) {
            schemaList = this.mapCommandSchemaArray(commandSchema, guildId);
        } else {
            schemaList = this.mapCommandSchemaArray([commandSchema], guildId);
        }

        const createdSchemaArray = await this.schemaService.create(schemaList);

        return createdSchemaArray.map((schema: Schema) => {
            return new SchemaDTO(schema);
        });
    }

    private mapCommandSchemaArray(commandSchemaList: CommandSchema[], guildId: string): NewSchema[] {
        const schemaList: NewSchema[] = commandSchemaList.map((commandSchema: CommandSchema) => {
            const schema: NewSchema = {
                guildId,
                name: commandSchema.name,
                aliases: String(commandSchema.aliases),
                coolDown: commandSchema.coolDown,
                adminOnly: commandSchema.adminOnly,
                description: commandSchema.description,
                command: commandSchema.command,
                category: commandSchema.category,
            };
            return schema;
        });

        return schemaList;
    }
}
