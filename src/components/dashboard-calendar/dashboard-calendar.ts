import { Component, ElementRef, ViewChild } from '@angular/core';
import { ViewController } from 'ionic-angular';
import datepicker from 'js-datepicker';
import moment, { Moment } from 'moment';

@Component({
  selector: 'dashboard-calendar',
  templateUrl: 'dashboard-calendar.html'
})
export class DashboardCalendarComponent {
  @ViewChild('DateStart') private readonly dateStart: ElementRef;
  @ViewChild('DateEnd') private readonly dateEnd: ElementRef;

  @ViewChild('StartDate') public startDateInput: ElementRef;
  @ViewChild('EndDate') public endDateInput: ElementRef;

  public isDisabled: boolean = true;

  public startDatepicker: any;
  public endDatepicker: any;

  public currentSelectedRange: number = 3;
  public currentComparedRange: number = 0;

  public selectedStartDate: string;
  public selectedEndDate: string;
  public comparedStartDate: string;
  public comparedEndDate: string;

  public dateRangeOptions: string[] = [
    'Today',
    'Yesterday',
    'Last 7 days',
    'Last 30 days',
    'Last 90 days',
    'Last month',
    'Last year',
    'Week to date',
    'Month to date',
    'Year to date'
  ];

  public compareOptions: string[] = ['Previous period', 'Previous year'];

  constructor(public viewCtrl: ViewController) {}

  public ionViewWillEnter(): void {
    this.startDatepicker = datepicker(this.dateStart.nativeElement, {
      id: 1,
      alwaysShow: true,
      onSelect: (instance, date) => {
        this.startDateInput.nativeElement.value = moment(date).format('YYYY-MM-DD');

        this.isDisabled = !Boolean(this.endDateInput.nativeElement.value);
      }
    });

    this.endDatepicker = datepicker(this.dateEnd.nativeElement, {
      id: 1,
      alwaysShow: true,
      onSelect: (instance, date) => {
        this.endDateInput.nativeElement.value = moment(date).format('YYYY-MM-DD');

        this.isDisabled = !Boolean(this.startDateInput.nativeElement.value);
      }
    });
  }

  public ionViewWillLeave(): void {
    this.startDatepicker.remove();
    this.endDatepicker.remove();
  }

  public handleDateRangeSelect(index: number): void {
    this.currentSelectedRange = index;

    const today: Date = new Date();

    switch (index) {
      case 0:
        this.setDateRange(today, today);
        break;

      case 1:
        const yesterday: Date = moment().subtract(1, 'days').toDate();
        this.setDateRange(yesterday, yesterday);
        break;

      case 2:
        const last7days: Date = moment().subtract(7, 'days').toDate();
        this.setDateRange(last7days, today);
        break;

      case 3:
        const last30days: Date = moment().subtract(30, 'days').toDate();
        this.setDateRange(last30days, today);
        break;

      case 4:
        const last90days: Date = moment().subtract(90, 'days').toDate();
        this.setDateRange(last90days, today);
        break;

      case 5:
        const lastmonthstart: Date = moment().subtract(1, 'month').startOf('month').toDate();
        const lastmonthend: Date = moment().subtract(1, 'month').endOf('month').toDate();
        this.setDateRange(lastmonthstart, lastmonthend);
        break;

      case 6:
        const lastyearstart: Date = moment().subtract(1, 'year').startOf('year').toDate();
        const lastyearend: Date = moment().subtract(1, 'year').endOf('year').toDate();
        this.setDateRange(lastyearstart, lastyearend);
        break;

      case 7:
        const startofweek: Date = moment().startOf('week').toDate();
        this.setDateRange(startofweek, today);
        break;

      case 8:
        const startofmonth: Date = moment().startOf('month').toDate();
        this.setDateRange(startofmonth, today);
        break;

      case 9:
        const startofyear: Date = moment().startOf('year').toDate();
        this.setDateRange(startofyear, today);
        break;

      default:
        break;
    }
  }

  public handleCompareSelect(index: number): void {
    this.currentComparedRange = index;

    let today: Moment = moment().subtract(1, 'days');

    switch (this.currentSelectedRange) {
      case 0:
        this.setCompareRange(today, today);
        break;

      case 1:
        const yesterday: Moment = moment().subtract(2, 'days');
        this.setCompareRange(yesterday, yesterday);
        break;

      case 2:
        today = moment().subtract(7, 'days');
        const last7days: Moment = moment().subtract(14, 'days');
        this.setCompareRange(last7days, today);
        break;

      case 3:
        today = moment().subtract(30, 'days');
        const last30days: Moment = moment().subtract(60, 'days');
        this.setCompareRange(last30days, today);
        break;

      case 4:
        today = moment().subtract(90, 'days');
        const last90days: Moment = moment().subtract(180, 'days');
        this.setCompareRange(last90days, today);
        break;

      case 5:
        const lastmonthstart: Moment = moment().subtract(2, 'month').startOf('month');
        const lastmonthend: Moment = moment().subtract(2, 'month').endOf('month');
        this.setCompareRange(lastmonthstart, lastmonthend);
        break;

      case 6:
        const lastyearstart: Moment = moment().subtract(2, 'year').startOf('year');
        const lastyearend: Moment = moment().subtract(2, 'year').endOf('year');
        this.setCompareRange(lastyearstart, lastyearend);
        break;

      case 7:
        today = moment().subtract(1, 'week');
        const startofweek: Moment = moment().subtract(1, 'week').startOf('week');
        this.setCompareRange(startofweek, today);
        break;

      case 8:
        today = moment().subtract(1, 'month');
        const startofmonth: Moment = moment().subtract(1, 'month').startOf('month');
        this.setCompareRange(startofmonth, today);
        break;

      case 9:
        today = moment().subtract(1, 'year');
        const startofyear: Moment = moment().subtract(1, 'year').startOf('year');
        this.setCompareRange(startofyear, today);
        break;

      default:
        break;
    }
  }

  public dismiss(apply: string): void {
    const startValue: string = this.startDateInput.nativeElement.value;
    const endValue: string = this.endDateInput.nativeElement.value;
    let data: any;

    if (apply) {
      if (!startValue || !endValue) {
        return;
      }

      this.handleCompareSelect(this.currentComparedRange);

      data = {
        selectedStartDate: this.selectedStartDate,
        selectedEndDate: this.selectedEndDate,
        comparedStartDate: this.comparedStartDate,
        comparedEndDate: this.comparedEndDate
      };
    }

    this.viewCtrl.dismiss(data);
  }

  private setDateRange(start: Date, end: Date): void {
    this.startDatepicker.setDate(start, true);
    this.endDatepicker.setDate(end, true);

    this.selectedStartDate = moment(start).toISOString();
    this.selectedEndDate = moment(end).toISOString();

    this.startDateInput.nativeElement.value = moment(start).format('YYYY-MM-DD');
    this.endDateInput.nativeElement.value = moment(end).format('YYYY-MM-DD');
  }

  private setCompareRange(start: Moment, end: Moment): void {
    this.comparedStartDate = this.currentComparedRange
      ? moment(start).subtract(1, 'year').toISOString()
      : moment(start).toISOString();
    this.comparedEndDate = this.currentComparedRange
      ? moment(end).subtract(1, 'year').toISOString()
      : moment(end).toISOString();
  }
}
