import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest } from '@angular/common/http';

import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Events } from 'ionic-angular/util/events';
import * as Constants from '../util/constants';
import * as ConstantsUrl from '../util/constants-url';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(private readonly events: Events) {

  }
  public intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    return next.handle(req).pipe(catchError((err, caught) => {
      if (err.status === 401 && req.url !== (ConstantsUrl.URL_BASE_EN + ConstantsUrl.URL_LOGIN)) {
        console.log("SHOULDNT BE HERE");
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