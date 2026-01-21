import { Injectable, NotFoundException } from '@nestjs/common';
import { GroupStatus, IGroupsResponse } from './types';
import { PaginationQueryDto } from '../common/dtos/pagination-query.dto';
import { CreateGroupDto } from './dtos/create-group.dto';
import { UpdateGroupDto } from './dtos/update-group.dto';
import { GroupEntity } from './groups.entity';
import { FindOptionsRelations, FindOptionsWhere, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '../users/users.entity';

@Injectable()
export class GroupsService {
  constructor(
    @InjectRepository(GroupEntity)
    private readonly repository: Repository<GroupEntity>,
  ) {}

  findOne(
    where: FindOptionsWhere<GroupEntity>,
    relations: FindOptionsRelations<GroupEntity> = {},
  ): Promise<GroupEntity | null> {
    return this.repository.findOne({ where, relations });
  }

  async getAllGroups(query: PaginationQueryDto): Promise<IGroupsResponse> {
    const { limit = 10, offset = 1 } = query;
    const [groups, total] = await this.repository.findAndCount({
      skip: offset - 1,
      take: limit,
    });

    return { data: groups, meta: { total, limit, offset } };
  }

  async getGroupUsersByGroupId(groupId: number): Promise<UserEntity[]> {
    const group = await this.repository.findOne({
      where: { id: groupId },
      relations: { users: true },
    });

    if (!group) {
      throw new NotFoundException(`Group not found`);
    }

    return group.users;
  }

  async createGroup(dto: CreateGroupDto): Promise<GroupEntity> {
    const newGroup = this.repository.create({
      name: dto.name,
      status: GroupStatus.EMPTY,
    });

    return this.repository.save(newGroup);
  }

  async getGroupById(id: number): Promise<GroupEntity> {
    const group = await this.repository.findOne({
      where: { id },
    });

    if (!group) {
      throw new NotFoundException(`Group not found`);
    }

    return group;
  }

  async updateGroup(id: number, dto: UpdateGroupDto): Promise<void> {
    const group = await this.repository.findOne({
      where: { id },
    });

    if (!group) {
      throw new NotFoundException(`Group not found`);
    }

    this.repository.merge(group, dto);

    await this.repository.save(group);
  }
}
