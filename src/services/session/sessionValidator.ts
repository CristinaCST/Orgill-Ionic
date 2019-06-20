import { Injectable, Injector } from '@angular/core';
import { Moment } from 'moment';
import { DateTimeService } from '../datetime/dateTimeService';
import { AuthService } from '../auth/auth';

@Injectable()
export class SessionValidatorService {

  constructor(private readonly injector: Injector) { }

    public isValidSession(): boolean {
        const authService: AuthService = this.injector.get(AuthService);
        if (!authService.User) {
          return false;
        }
        const now: Moment = DateTimeService.getCurrentDateTime();
        const receivedTimestamp: string = authService.User.time_stamp;
        const sessionTimestampWith4Days: Moment = DateTimeService.getTimeAfter4Days(receivedTimestamp);

        const status: boolean = sessionTimestampWith4Days.isSameOrAfter(now);
        if (!status) {
          authService.logout(true);
         // this.events.publish(Constants.EVENT_LOGIN_EXPIRED); TODO: Wat was here?
       }
        return status;
      }
}
