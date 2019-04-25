import { Injectable } from '@angular/core';
import { LocalStorageHelper } from '../../helpers/local-storage-helper';
import { DateTime } from '../datetime/DateTime';
import { USER } from '../../util/constants';

@Injectable()
export class SessionValidator{
    constructor(){
    }

    isValidSession(): boolean {
        if (!LocalStorageHelper.hasKey(USER)) {
          return false;
        }
     //   console.log("USER:"+ USER);
        const now = DateTime.getCurrentDateTime();
        const receivedTimestamp = (JSON.parse(LocalStorageHelper.getFromLocalStorage(USER)).time_stamp);
        const sessionTimestampWith4Days = DateTime.getTimeAfter4Days(receivedTimestamp);
       // console.log(sessionTimestampWith4Days.isSameOrAfter(now));
        return sessionTimestampWith4Days.isSameOrAfter(now);
      }
}