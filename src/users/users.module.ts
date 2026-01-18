import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { UserEntity } from './users.entity';
import { UsersRepository } from './users.repository';
import { GroupEntity } from '../groups/groups.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, GroupEntity])],
  providers: [UsersService, UsersRepository],
  controllers: [UsersController],
})
export class UsersModule {}
