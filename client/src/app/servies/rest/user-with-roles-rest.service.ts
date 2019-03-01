import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {IUser} from '../../entities/user';
import {GenericRestService} from '../generic-rest.service';
import {RestUrlPrefixService} from '../rest-url-prefix.service';

@Injectable()
export class UserWithRolesRestService extends GenericRestService<IUser> {
  constructor(http: HttpClient, private restUrlPrefix: RestUrlPrefixService) {
    super(http, restUrlPrefix.getApiRestPrefix() + '/user/withRoles');
  }
}
