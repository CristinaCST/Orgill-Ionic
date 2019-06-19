import { Injectable } from '@angular/core';
import { LocalStorageHelper } from '../../helpers/local-storage';
import { DateTimeService } from '../datetime/dateTime';
import * as Constants from '../../util/constants';
import { Moment } from 'moment';

@Injectable()
export class SessionValidatorService {

    public isValidSession(): boolean {
        if (!LocalStorageHelper.hasKey(Constants.USER)) {
          return false;
        }
        const now: Moment = DateTimeService.getCurrentDateTime();
        const receivedTimestamp: string = (JSON.parse(LocalStorageHelper.getFromLocalStorage(Constants.USER)).time_stamp);
        const sessionTimestampWith4Days: Moment = DateTimeService.getTimeAfter4Days(receivedTimestamp);

        const status: boolean = sessionTimestampWith4Days.isSameOrAfter(now);
        if (!status) {
         LocalStorageHelper.removeFromLocalStorage(Constants.USER);
         // this.events.publish(Constants.EVENT_LOGIN_EXPIRED);
       }
        return status;
      }
}
