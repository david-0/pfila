import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {IGroup} from '../../entities/group';
import {GenericRestService} from '../generic-rest.service';
import {RestUrlPrefixService} from '../rest-url-prefix.service';

@Injectable({
  providedIn: 'root',
})
export class GroupWithSubgroupsRestService extends GenericRestService<IGroup> {
  constructor(http: HttpClient, private restUrlPrefix: RestUrlPrefixService) {
    super(http, restUrlPrefix.getApiRestPrefix() + '/group/withSubgroups');
  }
}
