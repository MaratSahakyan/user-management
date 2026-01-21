import {
  IsArray,
  IsEnum,
  IsInt,
  ValidateNested,
  ArrayMaxSize,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';
import { UserStatus } from '../types';

export class UserStatusUpdateDto {
  @Type(() => Number)
  @IsInt()
  id: number;

  @IsEnum(UserStatus)
  status: UserStatus;
}

export class UpdateUsersStatusDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UserStatusUpdateDto)
  @ArrayMaxSize(500)
  @ArrayMinSize(1)
  users: UserStatusUpdateDto[];
}
