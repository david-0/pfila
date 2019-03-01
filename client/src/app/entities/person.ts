import {DtoId} from './dtoId';
import {ISubgroup} from './subgroup';

export interface IPerson extends DtoId {
  id: any;
  createDate?: Date;
  firstname: string;
  lastname: string;
  street: string;
  streetNumber?: string;
  plz: string;
  city: string;
  email?: string;
  phoneNumber: string;
  dateOfBirth: string;
  allergies?: string;
  comments?: string;
  notification: string;
  subgroup: ISubgroup;
  leader: boolean;
}
