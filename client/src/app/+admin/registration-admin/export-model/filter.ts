import {IPerson} from '../../../entities/person';

export class Filter {
  constructor(public readonly name: string, public readonly test: (p: IPerson) => boolean) {
  }
}
