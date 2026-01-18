import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from 'typeorm';
import { UserEntity } from '../users/users.entity';
import { GroupStatus } from './types';

@Entity('groups')
export class GroupEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({
    type: 'enum',
    enum: GroupStatus,
    default: GroupStatus.EMPTY,
  })
  status: GroupStatus;

  @ManyToMany(() => UserEntity, (user) => user.groups)
  users: UserEntity[];
}
