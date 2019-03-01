import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {from, Observable} from 'rxjs';
import {first, mergeMap} from 'rxjs/operators';
import {Role} from '../../entities/role';
import {GenericRestService} from '../generic-rest.service';
import {RestUrlPrefixService} from '../rest-url-prefix.service';

@Injectable()
export class RolesRestService extends GenericRestService<Role> {
  constructor(http: HttpClient, private restUrlPrefix: RestUrlPrefixService) {
    super(http, restUrlPrefix.getApiRestPrefix() + '/role');
  }

  public getRole(roleName: string): Observable<Role> {
    return this.getAll()
      .pipe(mergeMap(roles => from(roles)),
        first(role => role.name === roleName, {id: -1, name: '', users: []}));
  }
}
