import { CommandsNameEnum } from '../../../../commands/domain/enums/commandNamesEnum';
import { SchemaDictionary } from '../../../../commands/domain/interfaces/schemaDictionary';

export interface UpdateSchemaProps {
    modifiedsSchemaList: CommandsNameEnum[];
    schemaDictionary: SchemaDictionary;
    guildId: string;
    userId: string;
}
