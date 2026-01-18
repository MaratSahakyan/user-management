import {
  Controller,
  Get,
  Post,
  Delete,
  Patch,
  Query,
  Param,
  Body,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { PaginationQueryDto } from '../common/dtos/pagination-query.dto';
import { UpdateUsersStatusDto } from './dtos/update-users-status.dto';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { IUsersResponse } from './types';
import { GroupEntity } from '../groups/groups.entity';
import { UserEntity } from './users.entity';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  createUser(@Body() dto: CreateUserDto): Promise<UserEntity> {
    return this.usersService.createUser(dto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  getAllUsers(@Query() query: PaginationQueryDto): Promise<IUsersResponse> {
    return this.usersService.getAllUsers(query);
  }

  @Get(':userId')
  @HttpCode(HttpStatus.OK)
  getUserById(
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<UserEntity> {
    return this.usersService.getUserById(userId);
  }

  @Patch('status')
  @HttpCode(HttpStatus.NO_CONTENT)
  updateUsersStatus(@Body() dto: UpdateUsersStatusDto): Promise<void> {
    return this.usersService.updateUsersStatus(dto.users);
  }

  @Patch(':userId')
  @HttpCode(HttpStatus.OK)
  updateUser(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() dto: UpdateUserDto,
  ): Promise<void> {
    return this.usersService.updateUser(userId, dto);
  }

  @Get(':userId/groups')
  @HttpCode(HttpStatus.OK)
  getUserGroups(
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<GroupEntity[]> {
    return this.usersService.getUserGroups(userId);
  }

  @Post(':userId/groups/:groupId')
  @HttpCode(HttpStatus.CREATED)
  addUserToGroup(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('groupId', ParseIntPipe) groupId: number,
  ): Promise<void> {
    return this.usersService.addUserToGroup(userId, groupId);
  }

  @Delete(':userId/groups/:groupId')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeUserFromGroup(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('groupId', ParseIntPipe) groupId: number,
  ): Promise<void> {
    return this.usersService.removeUserFromGroup(userId, groupId);
  }
}
