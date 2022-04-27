import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import moment, { Moment } from 'moment';
import { DashboardProvider } from '../../providers/dashboard/dashboard';

enum CheckTypeOptions {
  Daily = 0,
  Weekly = 1,
  Monthly = 2,
  Yearly = 3
}

@Component({
  selector: 'dashboard-traffic-statistics',
  templateUrl: 'dashboard-traffic-statistics.html'
})
export class DashboardTrafficStatisticsComponent implements OnInit {
  @ViewChild('tableSearch') private readonly tableSearch: ElementRef;
  @Input() public isFullPage: boolean = false;

  public trafficStatistics: any;

  public stickyColumn: any = ['Customer Nr'];
  public tableHeaders: any = [];
  public tableData: any = [];

  public isSearch: boolean = false;
  public selectedTime: string = 'Daily';

  public timeOptions: any = {
    Daily: ['days', 'MMM DD, YYYY'],
    Weekly: ['weeks', 'WW, YYYY'],
    Monthly: ['months', 'MMM, YYYY'],
    Yearly: ['years', 'YYYY']
  };

  public currentTimeFrame: Moment = moment();
  public isLatestTimeFrame: boolean = true;

  public isLoadingTrafficStats: boolean = true;

  private pageNo: number = 1;

  constructor(private readonly dashboardProvider: DashboardProvider) {}

  public ngOnInit(): void {
    this.fetchTrafficStatistics(this.currentTimeFrame);
  }

  public toggleSearch(): void {
    this.isSearch = !this.isSearch;
    this.tableSearch.nativeElement.focus();
  }

  public handleSearch(value: string): void {
    this.resetTable();
    this.fetchTrafficStatistics(this.currentTimeFrame, value);
  }

  public handleTime(time: string): void {
    this.selectedTime = time;
    this.resetTable();
    this.fetchTrafficStatistics(this.currentTimeFrame);
  }

  public handleTimeControls(previous: string): void {
    const [option] = this.timeOptions[this.selectedTime];

    const currentTimeFrame: Moment = previous
      ? moment().subtract(8, option)
      : moment().diff(this.currentTimeFrame, option) === 0
      ? this.currentTimeFrame
      : moment(this.currentTimeFrame).add(8, option);

    if (moment(this.currentTimeFrame).diff(currentTimeFrame)) {
      this.fetchTrafficStatistics(currentTimeFrame);
    }

    this.currentTimeFrame = currentTimeFrame;
    this.isLatestTimeFrame = moment().diff(currentTimeFrame, option) === 0;
  }

  public handleTablePage(isNext?: boolean): void {
    if (this.pageNo === 1 && !isNext) {
      return;
    }

    this.pageNo = isNext ? this.pageNo + 1 : this.pageNo - 1;

    this.resetTable();
    this.fetchTrafficStatistics(this.currentTimeFrame);
  }

  private formatTableData(data: any, time: string = 'Daily'): void {
    const [option, format] = this.timeOptions[time];

    data.forEach(row => {
      this.stickyColumn.push(row.customerNo);

      this.tableHeaders = row.noOfChecks.map((_: any, i: number) => {
        const date: any = moment(this.currentTimeFrame).subtract(i, option);

        if (time === 'Weekly') {
          return `${date.startOf('week').format('MMM')} ${date.startOf('week').format('DD')}-${
            date.startOf('week').month() !== date.endOf('week').month() ? date.endOf('week').format('MMM') : ''
          } ${date.endOf('week').format('DD')}, ${date.format('YYYY')}`;
        }

        return date.format(format);
      });

      this.tableHeaders.push('TOTAL');

      this.tableData.push([...row.noOfChecks, row.totalChecks]);
    });
  }

  private resetTable(): void {
    this.stickyColumn = ['Customer Nr'];
    this.tableHeaders = [];
    this.tableData = [];
  }

  private fetchTrafficStatistics(startDate: Moment, customerNo?: string): void {
    this.isLoadingTrafficStats = true;

    this.dashboardProvider
      .getTrafficStatistics({
        pageNo: this.pageNo,
        chunkSize: this.isFullPage ? 10 : 4,
        startDate: moment(startDate).toISOString(),
        customerNo: customerNo,
        checkType: CheckTypeOptions[this.selectedTime]
      })
      .subscribe(response => {
        this.trafficStatistics = response;
        this.formatTableData(response.data, this.selectedTime);
        this.isLoadingTrafficStats = false;
      });
  }
}
