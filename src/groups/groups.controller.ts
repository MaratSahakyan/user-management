import {
  Controller,
  Get,
  Post,
  Patch,
  Query,
  Param,
  Body,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
} from '@nestjs/common';
import { GroupsService } from './groups.service';
import { PaginationQueryDto } from '../common/dtos/pagination-query.dto';
import { CreateGroupDto } from './dtos/create-group.dto';
import { UpdateGroupDto } from './dtos/update-group.dto';
import { IGroupsResponse } from './types';
import { GroupEntity } from './groups.entity';
import { UserEntity } from '../users/users.entity';

@Controller('groups')
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  createGroup(@Body() dto: CreateGroupDto): Promise<GroupEntity> {
    return this.groupsService.createGroup(dto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  getAllGroups(@Query() query: PaginationQueryDto): Promise<IGroupsResponse> {
    return this.groupsService.getAllGroups(query);
  }

  @Get(':groupId')
  @HttpCode(HttpStatus.OK)
  getGroupById(
    @Param('groupId', ParseIntPipe) groupId: number,
  ): Promise<GroupEntity> {
    return this.groupsService.getGroupById(groupId);
  }

  @Patch(':groupId')
  @HttpCode(HttpStatus.OK)
  updateGroup(
    @Param('groupId', ParseIntPipe) groupId: number,
    @Body() dto: UpdateGroupDto,
  ): Promise<void> {
    return this.groupsService.updateGroup(groupId, dto);
  }

  @Get(':groupId/users')
  @HttpCode(HttpStatus.OK)
  getGroupUsers(
    @Param('groupId', ParseIntPipe) groupId: number,
  ): Promise<UserEntity[]> {
    return this.groupsService.getGroupUsersByGroupId(groupId);
  }
}
