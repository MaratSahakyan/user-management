import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GroupEntity } from './groups.entity';
import { UserEntity } from '../users/users.entity';
import { UpdateGroupDto } from './dtos/update-group.dto';
import { GroupStatus } from './types';

@Injectable()
export class GroupsRepository {
  constructor(
    @InjectRepository(GroupEntity)
    private readonly repository: Repository<GroupEntity>,
  ) {}

  findAllWithPagination(
    limit: number,
    offset: number,
  ): Promise<[GroupEntity[], number]> {
    return this.repository
      .createQueryBuilder('group')
      .leftJoinAndSelect('group.users', 'user')
      .take(limit)
      .skip(offset - 1)
      .orderBy('group.id', 'ASC')
      .getManyAndCount();
  }

  findOneById(id: number): Promise<GroupEntity | null> {
    return this.repository
      .createQueryBuilder('group')
      .leftJoinAndSelect('group.users', 'user')
      .where('group.id = :id', { id })
      .getOne();
  }

  async getGroupUsers(groupId: number): Promise<UserEntity[]> {
    const group = await this.repository
      .createQueryBuilder('group')
      .leftJoinAndSelect('group.users', 'user')
      .where('group.id = :groupId', { groupId })
      .getOne();

    return group?.users || [];
  }

  async createGroup(name: string): Promise<GroupEntity> {
    const newGroup = this.repository.create({
      name,
      status: GroupStatus.EMPTY,
    });

    return this.repository.save(newGroup);
  }

  async updateGroup(id: number, dto: UpdateGroupDto): Promise<void> {
    const updateData: Partial<GroupEntity> = {};

    if (dto.name !== undefined) {
      updateData.name = dto.name;
    }

    if (dto.status !== undefined) {
      updateData.status = dto.status;
    }

    await this.repository
      .createQueryBuilder()
      .update(GroupEntity)
      .set(updateData)
      .where('id = :id', { id })
      .execute();
  }
}
