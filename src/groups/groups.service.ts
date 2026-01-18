import { Injectable, NotFoundException } from '@nestjs/common';
import { GroupsRepository } from './groups.repository';
import { IGroupsResponse } from './types';
import { PaginationQueryDto } from '../common/dtos/pagination-query.dto';
import { CreateGroupDto } from './dtos/create-group.dto';
import { UpdateGroupDto } from './dtos/update-group.dto';
import { GroupEntity } from './groups.entity';

@Injectable()
export class GroupsService {
  constructor(private readonly groupsRepository: GroupsRepository) {}

  async getAllGroups(query: PaginationQueryDto): Promise<IGroupsResponse> {
    const { limit = 10, offset = 1 } = query;
    const [groups, total] = await this.groupsRepository.findAllWithPagination(
      limit,
      offset,
    );

    return { data: groups, meta: { total, limit, offset } };
  }

  async getGroupUsersByGroupId(groupId: number): Promise<any[]> {
    const group = await this.groupsRepository.findOneById(groupId);

    if (!group) {
      throw new NotFoundException(`Group with ID ${groupId} not found`);
    }

    return this.groupsRepository.getGroupUsers(groupId);
  }

  async createGroup(dto: CreateGroupDto): Promise<GroupEntity> {
    return this.groupsRepository.createGroup(dto.name);
  }

  async getGroupById(id: number): Promise<GroupEntity> {
    const group = await this.groupsRepository.findOneById(id);

    if (!group) {
      throw new NotFoundException(`Group with ID ${id} not found`);
    }

    return group;
  }

  async updateGroup(id: number, dto: UpdateGroupDto): Promise<void> {
    const group = await this.groupsRepository.findOneById(id);

    if (!group) {
      throw new NotFoundException(`Group with ID ${id} not found`);
    }

    await this.groupsRepository.updateGroup(id, dto);
  }
}
