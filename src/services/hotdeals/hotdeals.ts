import { Injectable, NgZone } from '@angular/core';
import * as ConstantsUrl from '../../util/constants-url';
import * as Constants from '../../util/constants';
// import * as Strings from '../../util/strings';
import { ApiService } from '../api/api';
import { LocalStorageHelper } from '../../helpers/local-storage';
import { NavOptions } from 'ionic-angular';
import { ProductPage } from '../../pages/product/product';
import { NavigatorService } from '../navigator/navigator';
import { Observable } from 'rxjs';
import { APIResponse } from '../../interfaces/response-body/response';
import { Product } from '../../interfaces/models/product';
// import { Geolocation, Geoposition, PositionError } from '@ionic-native/geolocation';
import { HotDealNotification } from 'interfaces/models/hot-deal-notification';
import { NotificationResponse } from 'interfaces/response-body/notification-response';
import { TranslateService } from '@ngx-translate/core';
// import { PopoversService, PopoverContent } from '../../services/popovers/popovers';
// import { LoadingService } from '../../services/loading/loading';

export interface GeofenceLocation {
  lat: number;
  lng: number;
  radius: number;
}

@Injectable()
export class HotDealsService {
  constructor(
    private readonly apiProvider: ApiService,
    private readonly navigatorService: NavigatorService,
    private readonly apiService: ApiService,
    private readonly ngZone: NgZone,
    // private readonly geolocation: Geolocation,
    private readonly translation: TranslateService // private readonly popoversService: PopoversService
  ) {}

  private getHotDealsProduct(sku: string): Observable<APIResponse> {
    const params: any = {
      division: '',
      price_type: '',
      search_string: "'" + sku + "'",
      category_id: '',
      program_number: '',
      p: '1',
      rpp: '1',
      last_modified: ''
    };
    return this.apiProvider.get(ConstantsUrl.URL_PRODUCT_SEARCH, params);
  }

  public navigateToHotDeal(sku?: string): void {
    const searchSku: string = sku
      ? sku
      : LocalStorageHelper.getFromLocalStorage(Constants.ONE_SIGNAL_HOT_DEAL_SKU_PATH);
    if (!searchSku) {
      return;
    }

    this.getHotDealsProduct(sku).subscribe((receivedResponse: any) => {
      const responseData: Product[] = receivedResponse;
      if (responseData.length > 0) {
        responseData.filter(item => item.sku === sku);
        const hotDeal: any = {
          isHotDeal: true,
          SKU: sku,
          product: responseData[0]
        };

        this.ngZone.run(() => {
          // Fix for change detector deattaching randomly....
          this.navigatorService
            .push(ProductPage, hotDeal, { paramsEquality: false } as NavOptions)
            .catch(err => console.error(err));
        });
      }
    });
  }

  public getHotDealProgram(sku: string): Observable<APIResponse> {
    return this.apiService.get(`${ConstantsUrl.GET_HOTDEALS_PROGRAM}/${sku}`);
  }

  public checkGeofence(): void {
    // return new Promise((resolve, reject) => {
    //   Promise.all([
    //     this.apiService.get(ConstantsUrl.GET_HOTDEALS_GEOFENCE).toPromise()
    //     this.geolocation.getCurrentPosition({
    //       enableHighAccuracy: true,
    //       maximumAge: Constants.LOCATION_MAXIMUM_AGE,
    //       timeout: Constants.LOCATION_TIMEOUT
    //     })
    //   ]).then(
    //     (result: any) => {
    //       const geofenceLocation: GeofenceLocation = result[0];
    //       const currentLocation: Geoposition = result[1];
    //       const distance: number = this.distanceBetweenPoints(
    //         Number(geofenceLocation.lat),
    //         Number(geofenceLocation.lng),
    //         currentLocation.coords.latitude,
    //         currentLocation.coords.longitude
    //       );
    //       if (distance <= Number(geofenceLocation.radius) + currentLocation.coords.accuracy) {
    //         resolve(true);
    //       }
    //       resolve(false);
    //     },
    //     (err: PositionError) => {
    //       console.error(err);
    //       // Code 3 = Timeout expired => No location signal or location is off.
    //       const message: string = err.code === 3 ? Strings.LOCATION_ERROR : Strings.LOCATION_PERMISSIONS_MESSAGE;
    //       const popoverContent: PopoverContent = {
    //         type: Constants.PERMISSION_MODAL,
    //         title: Strings.GENERIC_MODAL_TITLE,
    //         message,
    //         positiveButtonText: Strings.MODAL_BUTTON_OK
    //       };
    //       LoadingService.hideAll();
    //       this.popoversService.show(popoverContent);
    //     }
    //   );
    // });
  }

  // private distanceBetweenPoints(lat1: number, lon1: number, lat2: number, lon2: number): number {
  //   const R: number = 6378.137;
  //   const dLat: number = (lat2 * Math.PI) / 180 - (lat1 * Math.PI) / 180;
  //   const dLon: number = (lon2 * Math.PI) / 180 - (lon1 * Math.PI) / 180;
  //   const a: number =
  //     Math.sin(dLat / 2) * Math.sin(dLat / 2) +
  //     Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  //   const c: number = Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 2;
  //   const d: number = R * c;
  //   return d * 1000;
  // }

  public getHotDealNotifications(): Promise<HotDealNotification[]> {
    return new Promise(resolve => {
      this.apiProvider
        .get(ConstantsUrl.GET_HOTDEALS_NOTIFICATIONS)
        .take(1)
        .subscribe((result: any) => {
          const notifications: NotificationResponse[] = result;
          if (notifications.length > 0) {
            const parsedNotifications: HotDealNotification[] = notifications.map(rawNotification => {
              return {
                id: rawNotification.id ? rawNotification.id : '',
                SKU: rawNotification.data ? (rawNotification.data.SKU ? rawNotification.data.SKU : '') : '',
                title:
                  this.translation.currentLang === 'fr'
                    ? rawNotification.headings.fr
                      ? rawNotification.headings.fr
                      : rawNotification.headings.en
                    : rawNotification.headings.en,
                content:
                  this.translation.currentLang === 'fr'
                    ? rawNotification.contents.fr
                      ? rawNotification.contents.fr
                      : rawNotification.contents.en
                    : rawNotification.contents.en,
                timestamp: rawNotification.completed_at ? rawNotification.completed_at : ''
              };
            });
            resolve(parsedNotifications);
          } else {
            resolve([]);
          }
        });
    });
  }

  private dealAccessString(SKU: string): string {
    return SKU.substring(0, 3) + Constants.OVERRIDE_ADDITIONAL_CODE;
  }

  /**
   * Tries to override hot deal purchase access with a given code.
   * @returns boolean Wether it succeded.
   */
  public overrideDealAccess(SKU: string, code: string): boolean {
    const accessString: string = this.dealAccessString(SKU);
    const codeValid: boolean = accessString === code;
    if (codeValid) {
      LocalStorageHelper.saveToLocalStorage(this.dealAccessString(SKU), Date.now());
    }
    return codeValid;
  }

  /**
   * Checks if the hot deal has a valid override, if it has an expired one, it clears it.
   * @param SKU SKU of current hot deal item
   */
  public dealHasValidOverride(SKU: string): boolean {
    const accessString: string = this.dealAccessString(SKU);
    const timestamp: string = LocalStorageHelper.getFromLocalStorage(accessString);
    if (timestamp) {
      const parsedDate: Date = new Date(Number(timestamp));
      if (parsedDate.getTime() + Constants.OVERRIDE_EXPIRE_TIME > Date.now()) {
        return true;
      }
      LocalStorageHelper.removeFromLocalStorage(accessString);
    }
    return false;
  }
}
