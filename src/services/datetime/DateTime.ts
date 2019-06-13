import { Injectable } from '@angular/core';
import moment from 'moment';


@Injectable()
export class dateTimeService {

  public static formatWithTime: string = 'MM/DD/YYYY hh:mm:ss';
  public static formatWithMonthYearDay: string = 'MM/DD/YYYY';

  public static dateInMonthDayYearFormat(date: string) {
    return moment(date, dateTimeService.formatWithMonthYearDay);
  }

  public static dateAndTimeFormat(date: string) {
    return moment(date, dateTimeService.formatWithTime);
  }

  public static getCurrentDateTime() {
    return moment();
  }

  public static getCurrentDate() {
    return moment();
  }

  public static getTimeAfter4Days(date: string) {
    return moment(date, dateTimeService.formatWithTime).add(4, 'days');
  }

}
