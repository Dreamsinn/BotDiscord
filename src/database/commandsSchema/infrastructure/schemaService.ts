import { Service } from '../../shared/infrastructure/service';
import { NewSchema } from '../domain/interfaces/newSchema';
import { Schema } from '../domain/schemaEntity';

export class SchemaService extends Service {
    private schemaRepository = this.dataSource.getRepository(Schema);

    public async create(newSchema: NewSchema[]): Promise<Schema[]> {
        const schema = this.schemaRepository.create(newSchema);
        return this.schemaRepository.save(schema);
    }

    public async getAllByGuildId(guildId: string): Promise<Schema[]> {
        return this.schemaRepository.findBy({ guildId });
    }

    public async update(schamaModifications: Schema[]): Promise<Schema[]> {
        return this.schemaRepository.save(schamaModifications);
    }
}
