import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { IUsersResponse, IUserStatusUpdate, UserStatus } from './types';
import { GroupEntity } from '../groups/groups.entity';
import { PaginationQueryDto } from '../common/dtos/pagination-query.dto';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { UserEntity } from './users.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { GroupsService } from '../groups/groups.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly repository: Repository<UserEntity>,
    private groupsService: GroupsService,
  ) {}

  async getAllUsers(query: PaginationQueryDto): Promise<IUsersResponse> {
    const { limit = 10, offset = 1 } = query;

    const [users, total] = await this.repository.findAndCount({
      relations: { groups: true },
      skip: offset - 1,
      take: limit,
    });

    return { data: users, meta: { total, limit, offset } };
  }

  async removeUserFromGroup(userId: number, groupId: number): Promise<void> {
    const [user, group, isUserInGroup] = await Promise.all([
      this.repository.findOne({ where: { id: userId } }),
      this.groupsService.findOne({ id: groupId }),
      this.repository.exists({
        where: { groups: { id: groupId } },
      }),
    ]);

    if (!user) {
      throw new NotFoundException(`User not found`);
    }

    if (!group) {
      throw new NotFoundException(`Group not found`);
    }

    if (!isUserInGroup) {
      throw new BadRequestException(`User is not a member of group`);
    }

    await this.repository
      .createQueryBuilder()
      .relation(UserEntity, 'groups')
      .of(userId)
      .remove(groupId);
  }

  async addUserToGroup(userId: number, groupId: number): Promise<void> {
    const [user, group, isUserInGroup] = await Promise.all([
      this.repository.findOne({ where: { id: userId } }),
      this.groupsService.findOne({ id: groupId }),
      this.repository.exists({
        where: { groups: { id: groupId } },
      }),
    ]);

    if (!user) {
      throw new NotFoundException(`User not found`);
    }

    if (!group) {
      throw new NotFoundException(`Group not found`);
    }

    if (isUserInGroup) {
      throw new ConflictException(`User already joined`);
    }

    await this.repository
      .createQueryBuilder()
      .insert()
      .into('user_groups')
      .values({ user_id: userId, group_id: groupId })
      .execute();
  }

  async getUserGroups(userId: number): Promise<GroupEntity[]> {
    const user = await this.repository.findOne({
      where: { id: userId },
      relations: { groups: true },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    return user.groups;
  }

  async updateUsersStatus(updates: IUserStatusUpdate[]): Promise<void> {
    if (!updates.length) return;

    const updatesById = new Map<number, UserStatus>();
    for (const { id, status } of updates) {
      updatesById.set(id, status);
    }

    const uniqueUpdates = Array.from(updatesById.entries()).map(([id, status]) => ({
      id,
      status,
    }));

    await this.repository.manager.transaction(async (manager) => {
      const userRepo = manager.getRepository(UserEntity);
      const ids = uniqueUpdates.map(u => u.id);

      const users = await userRepo.find({ where: { id: In(ids) } });

      const foundIds = new Set(users.map(u => u.id));
      const missingIds = ids.filter(id => !foundIds.has(id));

      if (missingIds.length) {
        throw new NotFoundException(`Users with IDs [${missingIds.join(', ')}] not found`);
      }

      for (const user of users) {
        user.status = updatesById.get(user.id)!;
      }

      await userRepo.save(users);
    });
  }


  async createUser(dto: CreateUserDto): Promise<UserEntity> {
    const newUser = this.repository.create({
      name: dto.name,
      status: UserStatus.PENDING,
    });

    return this.repository.save(newUser);
  }

  async getUserById(id: number): Promise<UserEntity> {
    const user = await this.repository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException(`User not found`);
    }

    return user;
  }

  async updateUser(id: number, dto: UpdateUserDto): Promise<void> {
    const user = await this.repository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException(`User not found`);
    }

    this.repository.merge(user, dto);

    await this.repository.save(user);
  }
}
