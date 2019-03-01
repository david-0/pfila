import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable} from 'rxjs';
import {DtoId} from '../entities/dtoId';

export class GenericRestService<T extends DtoId> {
  protected headers = new HttpHeaders({'Content-Type': 'application/json'});

  constructor(protected http: HttpClient, protected restUrl: string) {
  }

  add(item: T): Observable<T> {
    return this.http.post<T>(this.restUrl, JSON.stringify(item), {headers: this.headers});
  }

  update(item: T): Observable<boolean> {
    const url = `${this.restUrl}/${item.id}`;
    return this.http.put<boolean>(url, JSON.stringify(item), {headers: this.headers});
  }

  del(id: number): Observable<boolean> {
    const url = `${this.restUrl}/${id}`;
    return this.http.delete<boolean>(url, {headers: this.headers});
  }

  get(id: number): Observable<T> {
    const url = `${this.restUrl}/${id}`;
    return this.http.get<T>(url, {headers: this.headers});
  }

  getAll(): Observable<T[]> {
    return this.http.get<T[]>(this.restUrl, {headers: this.headers});
  }
}
