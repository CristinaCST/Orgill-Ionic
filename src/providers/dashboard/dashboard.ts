import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { ApiService } from '../../services/api/api';
import {
  GetCustomersByDcAndRoute,
  GetDcAndRoutes,
  GetDeliveriesDashboard,
  GetDeliveriesDashboardExcel,
  GetGeneralStatistics,
  GetStopsStatistics,
  GetStoreRouteAndStops,
  GetTrafficStatistics
} from '../../util/constants-url';

/*
  Generated class for the RouteTrackingProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class DashboardProvider {
  constructor(private readonly apiProvider: ApiService) {}

  // http://40.122.36.68/swagger/index.html

  public getGeneralStatistics(body: {
    selectedStartDate: string;
    selectedEndDate: string;
    comparedStartDate: string;
    comparedEndDate: string;
  }): Observable<any> {
    return this.apiProvider.post(GetGeneralStatistics, body, true, true);
  }

  public getTrafficStatistics(body: {
    pageNo: number;
    chunkSize: number;
    startDate: string;
    customerNo?: string;
    checkType: number;
  }): Observable<any> {
    return this.apiProvider.post(GetTrafficStatistics, body, true, true);
  }

  public getStopsStatistics(body: {
    chunkSize: number;
    customerNo: string | null;
    deliveryEndDate: string | null;
    deliveryStartDate: string | null;
    invoiceEndDate: string | null;
    invoiceStartDate: string | null;
    keyedIn: boolean | null;
    orderEndDate: string | null;
    orderStartDate: string | null;
    orderType: number;
    pageNo: number;
    route: string | null;
    sortType: number;
    visited: boolean | null;
  }): Observable<any> {
    return this.apiProvider.post(GetStopsStatistics, body, true, true);
  }

  public getStoreRouteAndStops(shipToNo: string): Observable<any> {
    return this.apiProvider.get(GetStoreRouteAndStops, {
      shipToNo
    });
  }

  public getDcAndRoutes(): Observable<any> {
    return this.apiProvider.get(GetDcAndRoutes, {}, '', true);
  }

  public getCustomersByDcAndRoute(body: { dc: string; route: string }): Observable<any> {
    return this.apiProvider.post(GetCustomersByDcAndRoute, body, true, true);
  }

  public getDeliveriesDashboard(body: {
    case: number;
    dc: string | null;
    endDate: string;
    orderType: number;
    pageNo: number;
    route: string | null;
    size: number;
    sortType: number;
    startDate: string;
  }): Observable<any> {
    return this.apiProvider.post(GetDeliveriesDashboard, body, true, true);
  }

  public getDeliveriesDashboardExcel(body: {
    case: number;
    dc: string | null;
    endDate: string;
    orderType: number;
    pageNo: number;
    route: string | null;
    size: number;
    sortType: number;
    startDate: string;
  }): Observable<any> {
    return this.apiProvider.post(GetDeliveriesDashboardExcel, body, true, true);
  }
}
