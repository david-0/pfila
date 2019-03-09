import {DtoId} from './dtoId';
import {Role} from './role';
import {UserAudit} from './user-audit';

export interface IUser extends DtoId {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  notification: boolean;
  roles: Role[];
  audits?: UserAudit[];
}
