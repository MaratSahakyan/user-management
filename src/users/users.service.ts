import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { IUsersResponse, IUserStatusUpdate } from './types';
import { GroupEntity } from '../groups/groups.entity';
import { PaginationQueryDto } from '../common/dtos/pagination-query.dto';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { UserEntity } from './users.entity';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async getAllUsers(query: PaginationQueryDto): Promise<IUsersResponse> {
    const { limit = 10, offset = 1 } = query;
    const [users, total] = await this.usersRepository.findAllWithPagination(
      limit,
      offset,
    );

    return { data: users, meta: { total, limit, offset } };
  }

  async removeUserFromGroup(userId: number, groupId: number): Promise<void> {
    const user = await this.usersRepository.findUserWithGroups(userId);

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    const isUserInGroup = user.groups?.some((g) => g.id === groupId);
    if (!isUserInGroup) {
      throw new BadRequestException(
        `User with ID ${userId} is not a member of group with ID ${groupId}`,
      );
    }

    await this.usersRepository.removeUserFromGroupWithStatusUpdate(
      userId,
      groupId,
    );
  }

  async addUserToGroup(userId: number, groupId: number): Promise<void> {
    const user = await this.usersRepository.findOneById(userId);
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    const userWithGroups =
      await this.usersRepository.findUserWithGroups(userId);

    if (userWithGroups?.groups && userWithGroups.groups.length > 0) {
      const existingGroup = userWithGroups.groups[0];
      throw new BadRequestException(
        `User with ID ${userId} is already a member of group with ID ${existingGroup.id}.`,
      );
    }

    await this.usersRepository.addUserToGroup(userId, groupId);
  }

  async getUserGroups(userId: number): Promise<GroupEntity[]> {
    const user = await this.usersRepository.findOneById(userId);
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    return this.usersRepository.getUserGroups(userId);
  }

  async updateUsersStatus(updates: IUserStatusUpdate[]): Promise<void> {
    const userIds = updates.map((u) => u.id);
    const existingUsers = await this.usersRepository.findByIds(userIds);

    if (existingUsers.length !== userIds.length) {
      const foundIds = existingUsers.map((u) => u.id);
      const missingIds = userIds.filter((id) => !foundIds.includes(id));
      throw new NotFoundException(
        `Users with IDs [${missingIds.join(', ')}] not found`,
      );
    }

    await this.usersRepository.updateUsersStatusBatch(updates);
  }

  async createUser(dto: CreateUserDto): Promise<UserEntity> {
    return this.usersRepository.createUser(dto.name);
  }

  async getUserById(id: number): Promise<UserEntity> {
    const user = await this.usersRepository.findOneById(id);

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async updateUser(userId: number, dto: UpdateUserDto): Promise<void> {
    const user = await this.usersRepository.findOneById(userId);

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    await this.usersRepository.updateUser(userId, dto);
  }
}
