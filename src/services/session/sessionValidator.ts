import { Injectable } from '@angular/core';
import { LocalStorageHelper } from '../../helpers/local-storage';
import { dateTimeService } from '../datetime/dateTime';
import { USER } from '../../util/constants';
import * as Constants from '../../util/constants';

@Injectable()
export class SessionValidatorService {

    public isValidSession(): boolean {
        if (!LocalStorageHelper.hasKey(USER)) {
          return false;
        }
        const now = dateTimeService.getCurrentDateTime();
        const receivedTimestamp = (JSON.parse(LocalStorageHelper.getFromLocalStorage(USER)).time_stamp);
        const sessionTimestampWith4Days = dateTimeService.getTimeAfter4Days(receivedTimestamp);

        const status = sessionTimestampWith4Days.isSameOrAfter(now);
        if (!status) {
         LocalStorageHelper.removeFromLocalStorage(Constants.USER);
         // this.events.publish(Constants.EVENT_LOGIN_EXPIRED);
       }
        return status;
      }
}
