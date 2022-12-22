import { Injectable } from '@angular/core';
// import { DateRangeOptions } from '@app/shared/enums';
// import { OverviewPopoverState } from '@app/shared/interfaces';
enum DateRangeOptions {
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
}

@Injectable()
export class CalendarService {
  // Popover stored values
  private st_selectedStartDate: Date = new Date();
  private st_selectedEndDate: Date = new Date();
  private st_selectedRange: number = 2;
  private st_compareToRange: number = 0;
  private st_compareStartDate: Date = new Date(new Date().setDate(new Date().getDate() - 1));
  private st_compareEndDate: Date = new Date(new Date().setDate(new Date().getDate() - 1));

  // Get the currently used data
  public getCurrentState(): any {
    return {
      selectedStartDate: this.st_selectedStartDate,
      selectedEndDate: this.st_selectedEndDate,
      selectedRange: this.st_selectedRange,
      compareToRange: this.st_compareToRange,
      compareStartDate: this.st_compareStartDate,
      compareEndDate: this.st_compareEndDate
    };
  }

  // Set the currently used data
  public setCurrentState(data: any): void {
    this.st_selectedStartDate = data.selectedStartDate;
    this.st_selectedEndDate = data.selectedEndDate;
    this.st_selectedRange = data.selectedRange;
    this.st_compareToRange = data.compareToRange;
    this.st_compareStartDate = data.compareStartDate;
    this.st_compareEndDate = data.compareEndDate;
  }

  // Set date range based on 'date range' select
  public setDateRange(selectedOption: number): { start: Date; end: Date } {
    const selectedStartDate: any = new Date();
    const selectedEndDate: any = new Date();

    switch (selectedOption) {
      case DateRangeOptions.Today:
        break;
      case DateRangeOptions.Yesterday:
        selectedStartDate.setDate(selectedStartDate.getDate() - 1);
        selectedEndDate.setDate(selectedEndDate.getDate() - 1);
        break;
      case DateRangeOptions['Last 7 days']:
        selectedStartDate.setDate(selectedStartDate.getDate() - 6);
        break;
      case DateRangeOptions['Last 30 days']:
        selectedStartDate.setDate(selectedStartDate.getDate() - 29);
        break;
      case DateRangeOptions['Last 90 days']:
        selectedStartDate.setDate(selectedStartDate.getDate() - 89);
        break;
      case DateRangeOptions['Last month']:
        selectedStartDate.setMonth(selectedStartDate.getMonth() - 1);
        selectedStartDate.setDate(1);
        selectedEndDate.setDate(0);
        break;
      case DateRangeOptions['Last year']:
        selectedStartDate.setFullYear(selectedStartDate.getFullYear() - 1);
        selectedStartDate.setMonth(0);
        selectedStartDate.setDate(1);
        selectedEndDate.setMonth(0);
        selectedEndDate.setDate(0);
        break;
      case DateRangeOptions['Week to date']:
        selectedStartDate.setHours((selectedStartDate.getDay() - 1) * -24);
        break;
      case DateRangeOptions['Month to date']:
        selectedStartDate.setDate(1);
        break;
      case DateRangeOptions['Year to date']:
        selectedStartDate.setMonth(0);
        selectedStartDate.setDate(1);
        break;
      default:
        break;
    }

    return { start: selectedStartDate, end: selectedEndDate };
  }

  // We create an array of Dates, using it's start and end
  public getArrayOfDates(startDate: Date, endDate: Date): Date[] {
    const dayDifference: any = Math.ceil(Math.abs(endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

    const arrayOfDates: Date[] = [];

    for (let index: number = 0; index <= dayDifference; index++) {
      const newDate: Date = new Date(endDate);
      arrayOfDates.push(new Date(newDate.setDate(newDate.getDate() - index)));
    }

    return arrayOfDates.reverse();
  }

  // Set 'compare to' dates
  public setCompareToPeriod(selectedOption: number, startDate: Date, endDate: Date): any {
    let start: Date;
    let end: Date;
    if (selectedOption) {
      start = new Date(startDate);
      end = new Date(endDate);
      start.setFullYear(start.getFullYear() - 1);
      end.setFullYear(end.getFullYear() - 1);
    } else {
      const dayDifference: any = Math.ceil(Math.abs(endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      end = new Date(startDate);
      end.setDate(end.getDate() - 1);
      start = new Date(end);
      start.setDate(start.getDate() - dayDifference);
    }
    return { start: start, end: end };
  }
}
