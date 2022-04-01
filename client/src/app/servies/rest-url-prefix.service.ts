import {Inject, Injectable, isDevMode} from '@angular/core';
import {WINDOW} from './window-provider';

@Injectable()
export class RestUrlPrefixService {

  constructor(@Inject(WINDOW) private window: Window) {
  }

  public getApiRestPrefix(): string {
    return this.getPublicRestPrefix() + '/api';
  }

  public getPublicRestPrefix(): string {
    if (isDevMode()) {
      return window.location.protocol + '//' + this.window.location.hostname + ':' + 3001;
    }
    return window.location.protocol + '//' + this.window.location.hostname + ':' + this.window.location.port;
  }

  public urlStartsWith(url: string, prefix: string) : boolean {
    const expectedUrlStart = this.getPublicRestPrefix() + prefix;
     return url.startsWith(expectedUrlStart);
  }
}
