import { GroupEntity } from './groups.entity';

export enum GroupStatus {
  EMPTY = 'empty',
  NOT_EMPTY = 'notEmpty',
}

export interface IPageMeta {
  total: number;
  limit: number;
  offset: number;
}

export interface IGroupsResponse {
  data: GroupEntity[];
  meta: IPageMeta;
}
