import {DtoId} from './dtoId';
import {IGroup} from './group';
import {IPerson} from './person';

export interface ISubgroup extends DtoId {
  id: any;
  name: string;
  minimumAge?: number;
  maximumAge?: number;
  responsible?: string;
  persons: IPerson[];
  group: IGroup;
}
