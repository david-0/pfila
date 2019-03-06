import {DtoId} from './dtoId';
import {Role} from './role';

export interface IUser extends DtoId {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  notification: boolean;
  roles: Role[];
}
