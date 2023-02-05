import { CommandSchema } from '../../commands/domain/interfaces/commandSchema';
import { CreateSchema } from './aplication/createSchema';
import { Schema } from './domain/schemaEntity';
import { SchemaService } from './infrastructure/schemaService';

export class SchemaController {
    private createUseCase: CreateSchema;

    constructor(schemaService: SchemaService) {
        this.createUseCase = new CreateSchema(schemaService);
    }

    public create(commandSchemaList: CommandSchema[]): Promise<Schema[]> {
        return this.createUseCase.call(commandSchemaList);
    }
}
