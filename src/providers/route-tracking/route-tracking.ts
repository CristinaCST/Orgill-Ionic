import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { ApiService } from '../../services/api/api';
import { SecureActionsService } from '../../services/secure-actions/secure-actions';
import {
  GET_STORE_ROUTE_AND_STOPS,
  GET_CUSTOMER_LOCATIONS,
  TEST_GET_TODAY_CUSTOMERS
} from '../../util/constants-url';

/*
  Generated class for the RouteTrackingProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class RouteTrackingProvider {
  constructor(
    private readonly apiProvider: ApiService,
    private readonly secureActions: SecureActionsService
  ) {}

  public getCustomerLocations(): Observable<any> {
    return this.secureActions.waitForAuth().flatMap(user => {
      return this.apiProvider.get(GET_CUSTOMER_LOCATIONS, '', {
        user_token: user.userToken
      });
    });
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
}
