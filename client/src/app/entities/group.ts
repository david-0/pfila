import {DtoId} from './dtoId';
import {ISubgroup} from './subgroup';

export interface IGroup extends DtoId {
  id: any;
  name: string;
  subgroups: ISubgroup[];
}
