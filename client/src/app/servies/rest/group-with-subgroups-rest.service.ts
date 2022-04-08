import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { IGroup } from '../../entities/group';
import { GenericRestService } from '../generic-rest.service';
import { RestUrlPrefixService } from '../rest-url-prefix.service';

@Injectable({
  providedIn: 'root',
})
export class GroupWithSubgroupsRestService extends GenericRestService<IGroup> {
  constructor(http: HttpClient, private restUrlPrefix: RestUrlPrefixService) {
    super(http, restUrlPrefix.getApiRestPrefix() + '/group/withSubgroups');
  }

  public getAll(): Observable<IGroup[]> {
    return super.getAll().pipe(map(groups =>
      groups.sort((a, b) => this.sortComparator(a, b))
    ))
  }

  private sortComparator(a: IGroup, b: IGroup): number {
    if (a.name == 'keine') {
      return 1;
    }
    if (b.name == 'keine') {
      return -1;
    }
    return a.name.localeCompare(b.name);
  }
}
