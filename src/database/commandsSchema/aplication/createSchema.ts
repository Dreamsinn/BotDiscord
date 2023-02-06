import { CommandSchema } from '../../../commands/domain/interfaces/commandSchema';
import { NewSchema } from '../domain/interfaces/newSchema';
import { Schema } from '../domain/schemaEntity';
import { SchemaService } from '../infrastructure/schemaService';

export class CreateSchema {
    private schemaService: SchemaService;
    constructor(schemaService: SchemaService) {
        this.schemaService = schemaService;
    }

    async call(commandSchema: CommandSchema | CommandSchema[], guildId: string): Promise<Schema[]> {
        if (commandSchema instanceof Array) {
            const schemaList = this.mapCommandSchemaArray(commandSchema, guildId);
            return this.schemaService.create(schemaList);
        }

        const schemaList = this.mapCommandSchemaArray([commandSchema], guildId);
        return this.schemaService.create(schemaList);
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
