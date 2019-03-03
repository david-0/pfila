import {Inject, Injectable} from '@angular/core';
import {SocketIoConfig} from 'ngx-socket-io';
import {WINDOW} from './window-provider';

@Injectable()
export class RestUrlPrefixService {

  constructor(@Inject(WINDOW) private window: Window) {
  }

  public getApiRestPrefix(): string {
    return this.getPublicRestPrefix() + '/api';
  }

  public getPublicRestPrefix(): string {
    return window.location.protocol + '://' + this.window.location.hostname + ':' + this.window.location.port;
  }
}
