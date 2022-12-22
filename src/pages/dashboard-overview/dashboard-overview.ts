import { Component, OnInit } from '@angular/core';
import { DashboardCalendarComponent } from '../../components/dashboard-calendar/dashboard-calendar';
import { Events, Modal, ModalController, NavController } from 'ionic-angular';
import { DashboardProvider } from '../../providers/dashboard/dashboard';
import moment from 'moment';

@Component({
  selector: 'tab-page-dashboard-overview',
  templateUrl: 'dashboard-overview.html'
})
export class DashboardOverview implements OnInit {
  public orderStatistics: any;
  public visitedStatistics: any;
  public keyedInStatistics: any;
  public searchesStatistics: any;

  public isGeneralStatisticsLoading: boolean = true;

  public hasSearch: boolean = false;

  public comparedToDate: string = `${moment().subtract(60, 'days').format('MMM DD')}-${moment()
    .subtract(30, 'days')
    .format('MMM DD, YYYY')}`;

  private readonly defaultPayload: any = {
    comparedEndDate: moment().subtract(30, 'days').toISOString(),
    comparedStartDate: moment().subtract(60, 'days').toISOString(),
    selectedEndDate: moment().toISOString(),
    selectedStartDate: moment().subtract(30, 'days').toISOString()
  };

  constructor(
    private readonly dashboardProvider: DashboardProvider,
    private readonly modalCtrl: ModalController,
    private readonly navController: NavController,
    private readonly events: Events
  ) {}

  public ngOnInit(): void {
    this.fetchGeneralStatistics();
  }

  public handleDate(e: Event): void {
    const modal: Modal = this.modalCtrl.create(
      DashboardCalendarComponent,
      {},
      { cssClass: 'dashboard-calendar-modal' }
    );

    modal.onDidDismiss(data => {
      if (data) {
        this.fetchGeneralStatistics(data);

        this.comparedToDate = `${moment(data.comparedStartDate).format('MMM DD')}-${moment(data.comparedEndDate).format(
          'MMM DD, YYYY'
        )}`;
      }
    });

    modal.present({ ev: e });
  }

  public toggleSearch(): void {
    this.hasSearch = !this.hasSearch;
  }

  public handleShipNoChange(value: any): void {
    if (value.length === 6 && !isNaN(value)) {
      this.events.publish('shipNo:deliveries', value);

      this.navController.parent.select(3);
    }
  }

  public handleTableRecords(): void {
    this.navController.parent.select(2);
  }

  private fetchGeneralStatistics(payload: any = this.defaultPayload): void {
    this.isGeneralStatisticsLoading = true;

    this.dashboardProvider.getGeneralStatistics(payload).subscribe(response => {
      this.orderStatistics = response.orderStatistics;
      this.visitedStatistics = response.visitedStatistics;
      this.keyedInStatistics = response.keyedInStatistics;
      this.searchesStatistics = response.searchesStatistics;

      this.isGeneralStatisticsLoading = false;
    });
  }
}
