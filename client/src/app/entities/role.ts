import {DtoId} from './dtoId';
import {IUser} from './user';

export interface Role extends DtoId {
  id: number;
  name: string;
  users: IUser[];
}
