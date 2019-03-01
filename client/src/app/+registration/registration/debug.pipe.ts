import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'debugPipe'
})
export class DebugPipe implements PipeTransform {

  transform(data: any): string {
    return data;
  }

}
