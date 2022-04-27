import { Component, OnInit } from '@angular/core';
import { DashboardCalendarComponent } from '../../components/dashboard-calendar/dashboard-calendar';
import { Modal, ModalController } from 'ionic-angular';
import { DashboardProvider } from '../../providers/dashboard/dashboard';
import moment from 'moment';
import { b64toBlob } from '../../helpers';

@Component({
  selector: 'tab-page-dashboard-drivers',
  templateUrl: 'dashboard-drivers.html'
})
export class DashboardDrivers implements OnInit {
  public hasSearch: boolean = false;
  public isLoading: boolean = true;
  public isPreparingExcel: boolean = false;
  public currentSelected: number = 0;

  public allUpdates: number = 0;
  public noUpdates: number = 0;
  public numberOfDeliveries: number = 0;
  public routeAndPartialLocationsUpdates: number = 0;
  public routeOrLocationsUpdates: number = 0;

  public stickyColumn: any = ['Route'];
  public tableHeaders: any = ['District', 'Driver e-mail', 'Delivery date', 'Driver case', 'Deliveries updated'];
  public tableData: any = [];

  private readonly driverCaseOptions: any = {
    1: 'NO MESSAGE OR LOCATION UPDATE',
    2: 'DRIVER SENT ROUTE MESSAGE - PARTIALLY DELIVERY UPDATES',
    3: 'DRIVER ENTERED ALL THE NECESSARY INFO',
    4: 'DRIVER SENT ROUTE MESSAGE OR LOCATION UPDATES'
  };
  private readonly driverCaseOptionsColors: any = {
    1: '#FF1925',
    2: '#2F67FF',
    3: '#00A000',
    4: '#FFBC39'
  };

  private currentPayload: any = {
    case: 0,
    orderType: 1,
    pageNo: 1,
    size: 9,
    sortType: 3,
    startDate: moment().subtract(30, 'days').toISOString(),
    endDate: moment().toISOString()
  };

  constructor(private readonly dashboardProvider: DashboardProvider, private readonly modalCtrl: ModalController) {}

  public ngOnInit(): void {
    this.fetchDeliveriesDashboard(this.currentPayload);
  }

  public toggleSearch(): void {
    this.hasSearch = !this.hasSearch;
  }

  public handleDate(e: Event): void {
    const modal: Modal = this.modalCtrl.create(
      DashboardCalendarComponent,
      {},
      { cssClass: 'dashboard-calendar-modal' }
    );

    modal.onDidDismiss(data => {
      if (data && data.selectedStartDate && data.selectedEndDate) {
        this.currentPayload = {
          ...this.currentPayload,
          startDate: data.selectedStartDate,
          endDate: data.selectedEndDate
        };

        this.fetchDeliveriesDashboard(this.currentPayload);
      }
    });

    modal.present({ ev: e });
  }

  public handlePill(index: number): void {
    this.currentSelected = index;
    this.currentPayload = { ...this.currentPayload, case: index };
    this.fetchDeliveriesDashboard(this.currentPayload);
  }

  public handleRouteSearch(value: string): void {
    if (!isNaN(Number(value))) {
      this.currentPayload = { ...this.currentPayload, route: value };
      this.fetchDeliveriesDashboard(this.currentPayload);
    }
  }

  public handleDCSearch(value: string): void {
    if (!isNaN(Number(value))) {
      this.currentPayload = { ...this.currentPayload, dc: value };
      this.fetchDeliveriesDashboard(this.currentPayload);
    }
  }

  public downloadExcel(): void {
    if (this.isPreparingExcel) {
      return;
    }

    this.isPreparingExcel = true;

    this.dashboardProvider.getDeliveriesDashboardExcel(this.currentPayload).subscribe(response => {
      const blob: Blob = b64toBlob(response.data, response.mimeType);

      let downloadLink: HTMLAnchorElement = document.createElement('a');

      const urlObj: string = URL.createObjectURL(blob);
      downloadLink.href = urlObj;
      downloadLink.download = 'DriversData';
      downloadLink.click();

      URL.revokeObjectURL(urlObj);
      downloadLink = undefined;

      this.isPreparingExcel = false;
    });
  }

  public handleTablePage(isNext?: boolean): void {
    const { pageNo } = this.currentPayload;

    if (pageNo === 1 && !isNext) {
      return;
    }

    this.currentPayload = { ...this.currentPayload, pageNo: isNext ? pageNo + 1 : pageNo - 1 };
    this.fetchDeliveriesDashboard(this.currentPayload);
  }

  private fetchDeliveriesDashboard(payload: any): void {
    this.isLoading = true;

    this.dashboardProvider.getDeliveriesDashboard(payload).subscribe(response => {
      this.formatTableData(response.deliveries);

      this.allUpdates = response.allUpdates;
      this.noUpdates = response.noUpdates;
      this.numberOfDeliveries = response.numberOfDeliveries;
      this.routeAndPartialLocationsUpdates = response.routeAndPartialLocationsUpdates;
      this.routeOrLocationsUpdates = response.routeOrLocationsUpdates;

      this.isLoading = false;
    });
  }

  private resetTable(): void {
    this.stickyColumn = ['Route'];
    this.tableHeaders = ['District', 'Driver e-mail', 'Delivery date', 'Driver case', 'Deliveries updated'];
    this.tableData = [];
  }

  private formatTableData(data: any): void {
    this.resetTable();

    data.forEach(row => {
      this.stickyColumn.push(row.route);

      this.tableData.push([
        row.dc,
        { isDriverEmail: true, value: row.driverEmail, noDriver: Boolean(row.driverEmail) },
        moment(row.deliveryDate).format('MM/DD/YYYY'),
        {
          isDriverCase: true,
          value: this.driverCaseOptions[row.driverCase],
          textColor: this.driverCaseOptionsColors[row.driverCase]
        },
        `${row.updatedDeliveries}/${row.totalDeliveries}`
      ]);
    });
  }
}
