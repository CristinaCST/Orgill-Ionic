import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { ApiService } from '../../services/api/api';
import {
  GET_STORE_ROUTE_AND_STOPS,
  GET_CUSTOMER_LOCATIONS,
  TEST_GET_TODAY_CUSTOMERS,
  ADMIN_GET_CUSTOMER_LOCATIONS,
  TRACKING_API_BASE_URL_PROD,
  SEND_BUG_REPORT,
  TRACKING_API_BASE_URL_DEV
} from '../../util/constants-url';
import { ReportFormData } from '../../interfaces/models/route-tracking';

/*
  Generated class for the RouteTrackingProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class RouteTrackingProvider {
  constructor(private readonly apiProvider: ApiService) {}

  public getCustomerLocations(): Observable<any> {
    return this.apiProvider.post(GET_CUSTOMER_LOCATIONS, {}, true, true, TRACKING_API_BASE_URL_PROD);
  }

  public getStoreRouteAndStops(ship_to_no: string): Observable<any> {
    return this.apiProvider.get(
      GET_STORE_ROUTE_AND_STOPS,
      {
        ship_to_no
      },
      TRACKING_API_BASE_URL_PROD
    );
  }

  public testGetTodayCustomers(numberOfShipments: number = 1): Observable<any> {
    return this.apiProvider.get(
      TEST_GET_TODAY_CUSTOMERS,
      {
        size: numberOfShipments
      },
      TRACKING_API_BASE_URL_PROD
    );
  }

  public adminGetCustomerLocations(customerNo: string): Observable<any> {
    return this.apiProvider.post(ADMIN_GET_CUSTOMER_LOCATIONS, { customerNo }, true, true, TRACKING_API_BASE_URL_PROD);
  }

  public sendBugReport(formData: ReportFormData): Observable<any> {
    return this.apiProvider.post(SEND_BUG_REPORT, formData, true, true, TRACKING_API_BASE_URL_PROD);
  }
}
