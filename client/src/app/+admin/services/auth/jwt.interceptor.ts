import { Inject, Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';

import { AuthenticationService } from './authentication.service';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
    constructor(private authenticationService: AuthenticationService, @Inject("baseUrl") private baseUrl: string) { }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        // add auth header with jwt if user is logged in and request is to the api url
        
        const isApiUrl = request.url.startsWith(this.baseUrl);
        if (this.authenticationService.loggedIn() && isApiUrl) {
            request = request.clone({
                setHeaders: {
                    Authorization: 'Bearer '+AuthenticationService.getAccessToken(),
                }
            });
        }

        return next.handle(request);
    }
}