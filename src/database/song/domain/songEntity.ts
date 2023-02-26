import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Song extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: string;

    @Column({
        unique: true,
    })
    YouTubeId: string;

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
