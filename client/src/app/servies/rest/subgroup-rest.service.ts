import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {ISubgroup} from '../../entities/subgroup';
import {GenericRestService} from '../generic-rest.service';
import {RestUrlPrefixService} from '../rest-url-prefix.service';

@Injectable()
export class SubgroupRestService extends GenericRestService<ISubgroup> {
  constructor(http: HttpClient, private restUrlPrefix: RestUrlPrefixService) {
    super(http, restUrlPrefix.getApiRestPrefix() + '/subgroup');
  }
}
