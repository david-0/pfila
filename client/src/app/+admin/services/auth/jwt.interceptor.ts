import { Inject, Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';

import { AuthenticationService } from './authentication.service';
import { RestUrlPrefixService } from 'src/app/servies/rest-url-prefix.service';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
    constructor(private authenticationService: AuthenticationService, private restUrlPrefixService: RestUrlPrefixService) { }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        // add auth header with jwt if user is logged in and request is to the api url
        if (this.authenticationService.loggedIn() && this.restUrlPrefixService.urlStartsWith(request.url, '/api')) {
            request = request.clone({
                setHeaders: {
                    Authorization: 'Bearer '+AuthenticationService.getAccessToken(),
                }
            });
        }

        return next.handle(request);
    }
}