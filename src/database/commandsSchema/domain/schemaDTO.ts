import { CommandsNameEnum } from '../../../commands/domain/enums/commandNamesEnum';
import { CommandsCategoryEnum } from '../../../commands/domain/enums/commandsCategoryEnum';
import { Schema } from './schemaEntity';

export class SchemaDTO {
    readonly id: number;
    readonly guildId: string;
    readonly name: string;
    readonly aliases: string[];
    readonly coolDown: number;
    readonly adminOnly: boolean;
    readonly description: string;
    readonly command: CommandsNameEnum;
    readonly category: CommandsCategoryEnum;
    readonly createdAt: Date;
    readonly updatedAt: Date;
    readonly updatedBy: string | null;

    constructor(schema: Schema) {
        this.id = schema.id;
        this.guildId = schema.guildId;
        this.name = schema.name;
        this.aliases = schema.aliases.split(',');
        this.coolDown = schema.coolDown;
        this.adminOnly = schema.adminOnly;
        this.description = schema.description;
        this.command = schema.command;
        this.category = schema.category;
        this.createdAt = schema.createdAt;
        this.updatedAt = schema.updatedAt;
        this.updatedBy = schema.updatedBy;
    }
}
