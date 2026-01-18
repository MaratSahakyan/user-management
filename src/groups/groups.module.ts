import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GroupEntity } from './groups.entity';
import { GroupsService } from './groups.service';
import { GroupsController } from './groups.controller';
import { GroupsRepository } from './groups.repository';

@Module({
  imports: [TypeOrmModule.forFeature([GroupEntity])],
  providers: [GroupsService, GroupsRepository],
  controllers: [GroupsController],
})
export class GroupsModule {}
