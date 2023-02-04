import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { CommandsCategoryEnum } from '../../../commands/domain/enums/commandsCategoryEnum';
// mirar tsconfig si falta algo
@Entity()
export class Schema extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    // convetir la array de alieses en string
    aliases: string;

    @Column()
    category: CommandsCategoryEnum;

    @Column()
    adminOnly: boolean;

    @Column()
    coolDown: number;

    @Column()
    description: string;
}
