import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {IPerson} from '../../entities/person';
import {GenericRestService} from '../generic-rest.service';
import {RestUrlPrefixService} from '../rest-url-prefix.service';

@Injectable()
export class PersonWithAllRestService extends GenericRestService<IPerson> {
  constructor(http: HttpClient, private restUrlPrefix: RestUrlPrefixService) {
    super(http, restUrlPrefix.getApiRestPrefix() + '/person/withAll');
  }
}
