import {IPerson} from '../../../entities/person';

export class Field {
  constructor(public readonly label: string, public readonly valueProvider: (p: IPerson) => string) {
  }
}
