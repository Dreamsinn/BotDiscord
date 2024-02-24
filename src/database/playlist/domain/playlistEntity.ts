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

  // userId
  @Column()
  createdBy: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // userId
  @Column({
    nullable: true,
  })
  updatedBy: string;
}
