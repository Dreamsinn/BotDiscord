import { Service } from '../../shared/infrastructure/Service';
import { Schema } from '../domain/schemaEntity';

export class SchemaService extends Service {
    private schemaRepository = this.dataSource.getRepository(Schema);

    public async Create(newSchema: Partial<Schema>[]): Promise<Schema[]> {
        const schema = this.schemaRepository.create(newSchema);
        return this.schemaRepository.save(schema);
    }
}
