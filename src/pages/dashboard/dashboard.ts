import { Component } from '@angular/core';
import { Page } from 'ionic-angular/navigation/nav-util';
import { DashboardStops } from '../dashboard-stops/dashboard-stops';
import { DashboardOverview } from '../dashboard-overview/dashboard-overview';
import { DashboardTraffic } from '../dashboard-traffic/dashboard-traffic';
import { DashboardDeliveries } from '../dashboard-deliveries/dashboard-deliveries';
import { DashboardDrivers } from '../dashboard-drivers/dashboard-drivers';
import { DashboardRoutes } from '../dashboard-routes/dashboard-routes';

@Component({
  selector: 'page-dashboard',
  templateUrl: 'dashboard.html'
})
export class Dashboard {
  public dashboardOverview: Page;
  public dashboardStops: Page;
  public dashboardTraffic: Page;
  public dashboardDeliveries: Page;
  public dashboardDrivers: Page;
  public dashboardRoutes: Page;

  constructor() {
    this.dashboardOverview = DashboardOverview;
    this.dashboardStops = DashboardStops;
    this.dashboardTraffic = DashboardTraffic;
    this.dashboardDeliveries = DashboardDeliveries;
    this.dashboardDrivers = DashboardDrivers;
    this.dashboardRoutes = DashboardRoutes;
  }
}
