import { Injectable } from '@angular/core';
import moment from 'moment';


@Injectable()
export class DateTime {

  static DATETIME_FORMAT_WITH_TIME = 'MM/DD/YYYY hh:mm:ss';
  static DATETIME_FORMAT_MONTH_DAY_YEAR = 'MM/DD/YYYY';

  static dateInMonthDayYearFormat(date: string): string {
    return moment(date).format(DateTime.DATETIME_FORMAT_MONTH_DAY_YEAR);
  }

  static dateAndTimeFormat(date: string): string {
    return moment(date).format(DateTime.DATETIME_FORMAT_WITH_TIME);
  }

  static getCurrentDateTime(): string {
    return moment().format(DateTime.DATETIME_FORMAT_WITH_TIME);
  }

  static getCurrentDate(): string {
    return moment().format(DateTime.DATETIME_FORMAT_MONTH_DAY_YEAR);
  }

  static getTimeAfter4Days(date: string): string {
    return moment(date).add(4, 'days').format(DateTime.DATETIME_FORMAT_WITH_TIME);
  }

}
