import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { ApiService } from '../../services/api/api';
import {
  GET_STORE_ROUTE_AND_STOPS,
  GET_CUSTOMER_LOCATIONS,
  TEST_GET_TODAY_CUSTOMERS,
  ADMIN_GET_CUSTOMER_LOCATIONS
} from '../../util/constants-url';

/*
  Generated class for the RouteTrackingProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class RouteTrackingProvider {
  constructor(private readonly apiProvider: ApiService) {}

  public getCustomerLocations(): Observable<any> {
    return this.apiProvider.post(GET_CUSTOMER_LOCATIONS, {}, true, true);
  }

  public getStoreRouteAndStops(ship_to_no: string): Observable<any> {
    return this.apiProvider.get(GET_STORE_ROUTE_AND_STOPS, '', {
      ship_to_no
    });
  }

  public testGetTodayCustomers(numberOfShipments: number = 1): Observable<any> {
    return this.apiProvider.get(TEST_GET_TODAY_CUSTOMERS, '', {
      size: numberOfShipments
    });
  }

  public adminGetCustomerLocations(customerNo: string): Observable<any> {
    return this.apiProvider.post(ADMIN_GET_CUSTOMER_LOCATIONS, { customerNo }, true, true);
  }
}
