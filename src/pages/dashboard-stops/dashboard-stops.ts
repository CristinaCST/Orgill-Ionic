import { Component, OnInit } from '@angular/core';
import moment from 'moment';
import { DashboardProvider } from '../../providers/dashboard/dashboard';

enum StopSortOptions {
  'Ship To No' = '1',
  'DC' = '4',
  'Route' = '5',
  'Stop Code' = '6'
}

@Component({
  selector: 'tab-page-dashboard-stops',
  templateUrl: 'dashboard-stops.html'
})
export class DashboardStops implements OnInit {
  public isStopsStatisticsLoading: boolean = true;

  public hasSearch: boolean = false;
  public customerNo: string;

  public stickyColumn: any = ['Ship To No.'];
  public tableHeaders: any = [
    'Bill To No.',
    'Order No.',
    'Invoice Date',
    'Order Date',
    'DC',
    'Route',
    'Stop Code',
    'Sales Rep.',
    'Keyed In',
    'Visited'
  ];
  public tableData: any = [];

  public stopsSortOptions: string[] = ['Default', 'Ship To No', 'DC', 'Route', 'Stop Code'];
  public stopsSortCurrentSelected: number = 0;

  public filterByOptions: any = [
    { type: 'checkbox', label: 'Keyed In', key: 'keyedin', values: ['True', 'False'] },
    { type: 'checkbox', label: 'Visited', key: 'visited', values: ['True', 'False'] },
    { type: 'daterange', label: 'Invoice Date', key: 'invoicedate' },
    { type: 'daterange', label: 'Order Date', key: 'orderdate' },
    { type: 'input', label: 'Route', key: 'route' }
  ];

  private currentPayload: any = {};
  private readonly defaultPayload: any = {
    chunkSize: 10,
    orderType: 1,
    pageNo: 1,
    sortType: 3
  };

  constructor(private readonly dashboardProvider: DashboardProvider) {}

  public ngOnInit(): void {
    this.fetchStopsStatistics(this.defaultPayload);
  }

  public toggleSearch(): void {
    this.hasSearch = !this.hasSearch;
  }

  public handleCustomerNoChange(value: any): void {
    if (value.length === 6 && !isNaN(value)) {
      this.currentPayload = { ...this.defaultPayload, ...this.currentPayload };

      this.currentPayload.customerNo = value;

      this.fetchStopsStatistics(this.currentPayload);
    }
  }

  public handleStopsSortSelect(index: number): void {
    this.currentPayload = { ...this.defaultPayload, ...this.currentPayload };

    if (index) {
      this.currentPayload.sortType = StopSortOptions[this.stopsSortOptions[index]];
    } else {
      this.currentPayload.sortType = 3;
    }

    this.fetchStopsStatistics(this.currentPayload);

    this.stopsSortCurrentSelected = index;
  }

  public handleFilters(info: any): void {
    this.currentPayload = { ...this.defaultPayload, ...this.currentPayload };

    const [type, filter, data, shouldRemove] = info;

    if (type === 'checkbox') {
      if (filter === 'keyedin') {
        this.currentPayload.keyedIn = data === 'True';
      } else {
        this.currentPayload.visited = data === 'True';
      }

      if (shouldRemove) {
        delete this.currentPayload.keyedIn;
        delete this.currentPayload.visited;
      }
    }

    if (type === 'daterange') {
      const [start, end] = data;

      if (filter === 'invoicedate') {
        this.currentPayload.invoiceStartDate = moment(start).toISOString();
        this.currentPayload.invoiceEndDate = moment(end).toISOString();
      } else {
        this.currentPayload.orderStartDate = moment(start).toISOString();
        this.currentPayload.orderEndDate = moment(end).toISOString();
      }
    }

    if (filter === 'route') {
      this.currentPayload.route = data;

      if (data.trim().length === 0) {
        delete this.currentPayload.route;
      }
    }

    this.fetchStopsStatistics(this.currentPayload);
  }

  public handleTablePage(isNext?: boolean): void {
    const { pageNo } = this.defaultPayload;

    if (pageNo === 1 && !isNext) {
      return;
    }

    this.currentPayload = { ...this.defaultPayload, pageNo: isNext ? pageNo + 1 : pageNo - 1 };
    this.fetchStopsStatistics(this.currentPayload);
  }

  private resetTable(): void {
    this.stickyColumn = ['Ship To No.'];
    this.tableHeaders = [
      'Bill To No.',
      'Order No.',
      'Invoice Date',
      'Order Date',
      'DC',
      'Route',
      'Stop Code',
      'Sales Rep.',
      'Keyed In',
      'Visited'
    ];
    this.tableData = [];
  }

  private formatTableData(data: any): void {
    data.forEach(row => {
      this.stickyColumn.push(row.shipToNo);

      this.tableData.push([
        row.billToNo,
        row.orderNo,
        moment(row.invoiceDate).format('MMM DD, YYYY'),
        moment(row.orderDate).format('MMM DD, YYYY hh:MM A'),
        row.dc,
        row.route,
        row.stopCode,
        row.salesRep,
        { isStops: true, value: row.keyedIn },
        { isStops: true, value: row.visited }
      ]);
    });
  }

  private fetchStopsStatistics(payload: any): void {
    this.isStopsStatisticsLoading = true;

    this.resetTable();

    this.dashboardProvider.getStopsStatistics(payload).subscribe(response => {
      this.formatTableData(response.stopsStatisticViewModels);

      this.isStopsStatisticsLoading = false;
    });
  }
}
