import {
    BaseEntity,
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
    Unique,
    UpdateDateColumn,
} from 'typeorm';

@Entity()
@Unique(['name', 'author'])
export class Playlist extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: string;

    @Column()
    name: string;

    @Column()
    songsId: string;

    @Column()
    privatePl: boolean;

    // privatePl true => author = userId, privatePl false => author = guildId
    @Column()
    author: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @Column({
        nullable: true,
    })
    updatedBy: string;
}
