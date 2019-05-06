import { Injectable } from '@angular/core';
import { LocalStorageHelper } from '../../helpers/local-storage';
import { dateTimeProvider } from '../datetime/dateTime';
import { USER } from '../../util/constants';

@Injectable()
export class SessionValidatorProvider{
    constructor(){
    }

    isValidSession(): boolean {
        if (!LocalStorageHelper.hasKey(USER)) {
          return false;
        }
     //   console.log("USER:"+ USER);
        const now = dateTimeProvider.getCurrentDateTime();
        const receivedTimestamp = (JSON.parse(LocalStorageHelper.getFromLocalStorage(USER)).time_stamp);
        const sessionTimestampWith4Days = dateTimeProvider.getTimeAfter4Days(receivedTimestamp);
       // console.log(sessionTimestampWith4Days.isSameOrAfter(now));
        return sessionTimestampWith4Days.isSameOrAfter(now);
      }
}
