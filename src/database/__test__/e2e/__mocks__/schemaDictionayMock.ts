import { CommandSchema } from '../../../../commands/domain/interfaces/commandSchema';
import { SchemaDictionary } from '../../../../commands/domain/interfaces/schemaDictionary';
import { commandsSchemasListMock } from './commandsSchemasListMock';

function makeSchemaDictionaryMock(schemasList: CommandSchema[]) {
    const schemaDictionary: any = {};
    schemasList.map((commandSchema: CommandSchema) => {
        schemaDictionary[commandSchema.command] = commandSchema;
    });

    return schemaDictionary;
}

export const commandDictionaryMock: SchemaDictionary = makeSchemaDictionaryMock(commandsSchemasListMock);
