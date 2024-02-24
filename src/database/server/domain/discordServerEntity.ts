import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class DiscordServer extends BaseEntity {
  @PrimaryColumn()
  id: string; //discord guild id

  @Column()
  name: string;

  @Column()
  prefix: string;

  @Column({
    nullable: true,
  })
  adminRole: string;

  @Column({
    nullable: true,
  })
  blackList: string;

  @Column()
  language: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({
    nullable: true,
  })
  updatedBy: string;
}
