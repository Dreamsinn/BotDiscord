import { BaseEntity, Column, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { CommandsNameEnum } from '../../../commands/domain/enums/commandNamesEnum';
import { CommandsCategoryEnum } from '../../../commands/domain/enums/commandsCategoryEnum';

@Entity()
export class Schema extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    guildId: string;

    @Column()
    name: string;

    @Column()
    aliases: string;

    @Column()
    coolDown: number;

    @Column()
    adminOnly: boolean;

    @Column()
    description: string;

    @Column()
    command: CommandsNameEnum;

    @Column()
    category: CommandsCategoryEnum;

    @UpdateDateColumn()
    updatedAt: Date;

    @Column({
        nullable: true,
    })
    updatedBy: string;
}
