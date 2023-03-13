import { BaseEntity, Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class Song extends BaseEntity {
    @PrimaryColumn()
    id: string; //youtube id

    @Column()
    name: string;

    @Column()
    durationHours: number;

    @Column()
    durationMinutes: number;

    @Column()
    durationSeconds: number;

    @Column()
    durationString: string;

    @Column({
        nullable: true,
    })
    thumbnail: string;
}
