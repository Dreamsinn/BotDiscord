import { CommandsNameEnum } from '../../../commands/domain/enums/commandNamesEnum';
import { CommandSchema } from '../../../commands/domain/interfaces/commandSchema';
import { UpdateSchemaProps } from '../domain/interfaces/updateShcemaProps';
import { Schema } from '../domain/schemaEntity';
import { SchemaService } from '../infrastructure/schemaService';

export class UpdateSchema {
    constructor(private schemaService: SchemaService) {}

    public async call({
        modifiedsSchemaList,
        schemaDictionary,
        guildId,
        userId,
    }: UpdateSchemaProps): Promise<Schema[]> {
        const schemasByGuild = await this.schemaService.getAllByGuildId(guildId);

        const updatedAt = new Date();

        const updatedsSchema: Schema[] = modifiedsSchemaList.flatMap((command: CommandsNameEnum) => {
            const commandSchema: CommandSchema = schemaDictionary[`${command}`];
            const schemaEntity: Schema | undefined = schemasByGuild.find(
                (schema: Schema) => schema.command === command,
            );
            if (schemaEntity) {
                schemaEntity.coolDown = commandSchema.coolDown;
                schemaEntity.adminOnly = commandSchema.adminOnly;
                schemaEntity.updatedAt = updatedAt;
                schemaEntity.updatedBy = userId;

                return schemaEntity;
            }
            return [];
        });

        return this.schemaService.update(updatedsSchema);
    }
}
