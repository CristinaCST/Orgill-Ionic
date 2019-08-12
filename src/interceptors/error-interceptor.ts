import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest } from '@angular/common/http';

import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Events } from 'ionic-angular/util/events';
import * as Constants from '../util/constants';
import * as ConstantsUrl from '../util/constants-url';
import { environment } from '../environments/environment';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(private readonly events: Events) { }

  public intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(catchError(err => {
      if (err.status === 401 && req.url !== (environment.baseUrlEnglish + ConstantsUrl.URL_LOGIN)) {
        this.events.publish(Constants.EVENT_INVALID_AUTH);
        return Observable.throw('Unauthorized');
      }
      if (err.status === 500 || err.status === 502 || err.status === 503) {
        this.events.publish(Constants.EVENT_SERVER_ERROR);
      }
      return Observable.throw('Error');
    }));
  }
}