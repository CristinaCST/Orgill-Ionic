import { Injectable } from '@angular/core';
import moment, { Moment } from 'moment';


@Injectable()
export class DateTimeService {

  public static formatWithTime: string = 'MM/DD/YYYY hh:mm:ss';
  public static formatWithMonthYearDay: string = 'MM/DD/YYYY';

  public static dateInMonthDayYearFormat(date: string): Moment {
    return moment(date, DateTimeService.formatWithMonthYearDay);
  }

  public static dateAndTimeFormat(date: string): Moment {
    return moment(date, DateTimeService.formatWithTime);
  }

  public static getCurrentDateTime(): Moment {
    return moment();
  }

  public static getCurrentDate(): Moment {
    return moment();
  }

  public static getTimeAfter4Days(date: string): Moment {
    return moment(date, DateTimeService.formatWithTime).add(4, 'days');
  }

}
