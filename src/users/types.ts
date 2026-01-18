import { UserEntity } from './users.entity';

export enum UserStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  BLOCKED = 'blocked',
}

export interface IUserStatusUpdate {
  id: number;
  status: UserStatus;
}

export interface IPageMeta {
  total: number;
  limit: number;
  offset: number;
}

export interface IUsersResponse {
  data: UserEntity[];
  meta: IPageMeta;
}
