import {Inject, Injectable} from '@angular/core';
import {WINDOW} from './window-provider';

@Injectable()
export class RestUrlPrefixService {

  constructor(@Inject(WINDOW) private window: Window) {
  }

  private getHostname(): string {
    return this.window.location.hostname;
  }

  public getApiRestPrefix(): string {
    return this.getPublicRestPrefix() + '/api';
  }

  public getPublicRestPrefix(): string {
    return 'http://' + this.getHostname() + ':3001';
  }
}
