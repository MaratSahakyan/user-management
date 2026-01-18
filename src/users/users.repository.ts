import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from './users.entity';
import { GroupEntity } from '../groups/groups.entity';
import { IUserStatusUpdate, UserStatus } from './types';
import { GroupStatus } from '../groups/types';
import { UpdateUserDto } from './dtos/update-user.dto';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectRepository(UserEntity)
    private readonly repository: Repository<UserEntity>,
  ) {}

  private updateGroupStatusAsync(groupId: number): void {
    // TODO: Refactor to SQL trigger function
    this.repository.manager
      .transaction(async (manager) => {
        const result = await manager
          .createQueryBuilder()
          .select('COUNT(*)', 'count')
          .from('user_groups', 'ug')
          .where('ug.group_id = :groupId', { groupId })
          .getRawOne();

        const count = parseInt(result?.count || '0', 10);
        const newStatus =
          count === 0 ? GroupStatus.EMPTY : GroupStatus.NOT_EMPTY;

        await manager
          .createQueryBuilder()
          .update(GroupEntity)
          .set({ status: newStatus })
          .where('id = :groupId', { groupId })
          .execute();
      })
      .catch((error) => {
        console.error(`Failed to update group ${groupId} status:`, error);
      });
  }

  findAllWithPagination(
    limit: number,
    offset: number,
  ): Promise<[UserEntity[], number]> {
    return this.repository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.groups', 'group')
      .take(limit)
      .skip(offset - 1)
      .orderBy('user.id', 'ASC')
      .getManyAndCount();
  }

  findUserWithGroups(userId: number): Promise<UserEntity | null> {
    return this.repository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.groups', 'group')
      .where('user.id = :userId', { userId })
      .getOne();
  }

  async findByIds(ids: number[]): Promise<UserEntity[]> {
    if (ids.length === 0) {
      return [];
    }

    return this.repository
      .createQueryBuilder('user')
      .where('user.id IN (:...ids)', { ids })
      .getMany();
  }

  async updateUsersStatusBatch(updates: IUserStatusUpdate[]): Promise<void> {
    if (updates.length === 0) return;

    await this.repository.manager.transaction(async (manager) => {
      const ids = updates.map((u) => u.id);

      const caseStatements = updates
        .map(
          (update) =>
            `WHEN ${update.id} THEN '${update.status}'::users_status_enum`,
        )
        .join(' ');

      await manager
        .createQueryBuilder()
        .update(UserEntity)
        .set({ status: () => `CASE id ${caseStatements} END` })
        .where('id IN (:...ids)', { ids })
        .execute();
    });
  }

  async removeUserFromGroupWithStatusUpdate(
    userId: number,
    groupId: number,
  ): Promise<void> {
    await this.repository.manager
      .createQueryBuilder()
      .delete()
      .from('user_groups')
      .where('user_id = :userId', { userId })
      .andWhere('group_id = :groupId', { groupId })
      .execute();

    this.updateGroupStatusAsync(groupId);
  }

  async addUserToGroup(userId: number, groupId: number): Promise<void> {
    const existingRelation = await this.repository
      .createQueryBuilder()
      .select('1')
      .from('user_groups', 'ug')
      .where('ug.user_id = :userId', { userId })
      .andWhere('ug.group_id = :groupId', { groupId })
      .getRawOne();

    if (existingRelation) {
      return;
    }

    await this.repository
      .createQueryBuilder()
      .insert()
      .into('user_groups')
      .values({ user_id: userId, group_id: groupId })
      .execute();

    this.updateGroupStatusAsync(groupId);
  }

  async getUserGroups(userId: number): Promise<GroupEntity[]> {
    const user = await this.repository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.groups', 'group')
      .where('user.id = :userId', { userId })
      .getOne();

    return user?.groups || [];
  }

  async createUser(name: string): Promise<UserEntity> {
    const newUser = this.repository.create({
      name,
      status: UserStatus.PENDING,
    });

    return this.repository.save(newUser);
  }

  async findOneById(id: number): Promise<UserEntity | null> {
    return this.repository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.groups', 'group')
      .where('user.id = :id', { id })
      .getOne();
  }

  async updateUser(id: number, dto: UpdateUserDto): Promise<void> {
    const updateData: Partial<UserEntity> = {};

    if (dto.name !== undefined) {
      updateData.name = dto.name;
    }

    if (dto.status !== undefined) {
      updateData.status = dto.status;
    }

    await this.repository
      .createQueryBuilder()
      .update(UserEntity)
      .set(updateData)
      .where('id = :id', { id })
      .execute();
  }
}
