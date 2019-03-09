import {IUser} from './user';

export interface UserAudit {
  user: IUser;
  date?: Date;
  action: string;
  actionResult: string;
  additionalData: string;
  ip?: string;
  userAgent?: string;
} 
