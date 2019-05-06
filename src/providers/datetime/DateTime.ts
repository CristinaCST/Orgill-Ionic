import {Injectable} from '@angular/core';
import moment from 'moment';


@Injectable()
export class dateTimeProvider {

  static formatWithTime = 'MM/DD/YYYY hh:mm:ss';
  static formatWithMonthYearDay = 'MM/DD/YYYY';

  static dateInMonthDayYearFormat(date: string) {
    return moment(date, this.formatWithMonthYearDay);
  }

  static dateAndTimeFormat(date: string) {
    return moment(date, this.formatWithTime);
  }

  static getCurrentDateTime() {
    return moment();
  }

  static getCurrentDate() {
    return moment();
  }

  static getTimeAfter4Days(date: string) {
    return moment(date, dateTimeProvider.formatWithTime).add(4, 'days');
  }

}
