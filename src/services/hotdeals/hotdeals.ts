import { Injectable, NgZone } from '@angular/core';
import * as ConstantsUrl from '../../util/constants-url';
import * as Constants from '../../util/constants';
import * as Strings from '../../util/strings';
import { ApiService } from '../api/api';
import { LocalStorageHelper } from '../../helpers/local-storage';
import { NavOptions, Events } from 'ionic-angular';
import { ProductPage } from '../../pages/product/product';
import { NavigatorService } from '../navigator/navigator';
import { Observable } from 'rxjs';
import { APIResponse } from '../../interfaces/response-body/response';
import { Product } from '../../interfaces/models/product';
import { AuthService } from '../../services/auth/auth';
import { Geolocation, Geoposition } from '@ionic-native/geolocation';
import { HotDealNotification } from 'interfaces/models/hot-deal-notification';
import { NotificationResponse } from 'interfaces/response-body/notification-response';
import { TranslateService } from '@ngx-translate/core';
import { PopoversService, PopoverContent } from '../../services/popovers/popovers';
import { LoadingService } from '../../services/loading/loading';

export interface GeofenceLocation{
    lat: number;
    lng: number;
    radius: number;
}

@Injectable()
export class HotDealsService {

  constructor(private readonly apiProvider: ApiService,
    private readonly navigatorService: NavigatorService,
    private readonly events: Events,
    private readonly apiService: ApiService,
    private readonly authService: AuthService,
    private readonly ngZone: NgZone,
    private readonly geolocation: Geolocation,
    private readonly translation: TranslateService,
    private readonly popoversService: PopoversService) { }

  private getHotDealsProduct(sku: string): Observable<APIResponse> {

    const params: any = {
      'user_token': this.authService.userToken,
      'division': '',
      'price_type': '',
      'search_string': '\'' + sku + '\'',
      'category_id': '',
      'program_number': '',
      'p': '1',
      'rpp': '1',
      'last_modified': ''
    };
    return this.apiProvider.post(ConstantsUrl.URL_PRODUCT_SEARCH, params);
  }

  public navigateToHotDeal(sku?: string): void {
    const searchSku: string = sku ? sku : LocalStorageHelper.getFromLocalStorage(Constants.ONE_SIGNAL_HOT_DEAL_SKU_PATH);
    if (!searchSku) {
      return;
    }

    this.getHotDealsProduct(sku).subscribe(receivedResponse => {
      const responseData: Product[] = JSON.parse(receivedResponse.d);
      if (responseData.length > 0) {
        responseData.filter(item => item.SKU === sku);
        const hotDeal: any = {
          isHotDeal: true,
          SKU: sku,
          product: responseData[0]
        };

        this.ngZone.run(() => { // Fix for change detector deattaching randomly....
          this.navigatorService.push(ProductPage, hotDeal, { paramsEquality: false } as NavOptions).catch(err => console.error(err));
        });
      }
    });
  }


  public isHotDealExpired(timestamp?: string): boolean {
    return false;
    // const dateString: string = timestamp ? timestamp : LocalStorageHelper.getFromLocalStorage(Constants.ONE_SIGNAL_PAYLOAD_TIMESTAMP);
    // const hotDealTimestamp: Date = new Date(parseInt(dateString, 10));
    //
    // if (Constants.DEBUG_ONE_SIGNAL) {
    //   return false;
    // }
    //
    // if ((new Date()).getDay() !== hotDealTimestamp.getDay()) {
    //   this.markHotDealExpired();
    //   return true;
    // }
    // return false;
  }

  public markHotDealExpired(): void {
    LocalStorageHelper.removeFromLocalStorage(Constants.ONE_SIGNAL_HOT_DEAL_SKU_PATH);
    LocalStorageHelper.removeFromLocalStorage(Constants.ONE_SIGNAL_PAYLOAD_TIMESTAMP);
    this.events.publish(Constants.HOT_DEAL_EXPIRED_EVENT);
  }

  public checkHotDealState(sku?: string): boolean {
    const hotDealSku: string = sku ? sku : LocalStorageHelper.getFromLocalStorage(Constants.ONE_SIGNAL_HOT_DEAL_SKU_PATH);
    return hotDealSku && !this.isHotDealExpired() ? true : false;
  }

  public getHotDealProgram(sku: string): Observable<APIResponse> {
    const params: any = {
      user_token: this.authService.userToken,
      sku: sku
    };

    return this.apiService.post(ConstantsUrl.GET_HOTDEALS_PROGRAM, params);
  }

  public checkGeofence(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const params: any = {
        user_token: this.authService.userToken
      };


      Promise.all([this.apiService.post(ConstantsUrl.GET_HOTDEALS_GEOFENCE, params).toPromise(), this.geolocation.getCurrentPosition({ enableHighAccuracy: true, maximumAge: Constants.LOCATION_MAXIMUM_AGE, timeout: Constants.LOCATION_TIMEOUT })]).then(result => {
        const geofenceLocation: GeofenceLocation = JSON.parse(result[0].d);
        const currentLocation: Geoposition = result[1];
        const distance: number = this.distanceBetweenPoints(Number(geofenceLocation.lat), Number(geofenceLocation.lng), currentLocation.coords.latitude, currentLocation.coords.longitude);
        if (distance <= (Number(geofenceLocation.radius) + currentLocation.coords.accuracy)) { 
          resolve(true);
        }
        resolve(false);
      }, (err: PositionError) => {
        console.error(err);
        // Code 3 = Timeout expired => No location signal or location is off.
        const message: string = err.code === 3 ? Strings.LOCATION_ERROR : Strings.LOCATION_PERMISSIONS_MESSAGE;

        const popoverContent: PopoverContent = {
          type: Constants.PERMISSION_MODAL,
          title: Strings.GENERIC_MODAL_TITLE,
          message,
          positiveButtonText: Strings.MODAL_BUTTON_OK
        };

        LoadingService.hideAll();
        this.popoversService.show(popoverContent);
      });
    });
  }

  private distanceBetweenPoints(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R: number = 6378.137;
    const dLat: number = lat2 * Math.PI / 180 - lat1 * Math.PI / 180;
    const dLon: number = lon2 * Math.PI / 180 - lon1 * Math.PI / 180;
    const a: number = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c: number = Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 2;
    const d: number = R * c;
    return d * 1000;
  }

  public getHotDealNotifications(): Promise<HotDealNotification[]> {
    return new Promise(resolve => {
      const params: any = {
        user_token: this.authService.userToken
      };

      this.apiProvider.post(ConstantsUrl.GET_HOTDEALS_NOTIFICATIONS, params).take(1).subscribe((result: APIResponse) => {
        const notifications: NotificationResponse[] = JSON.parse(result.d);
        if (notifications.length > 0) {
          const parsedNotifications: HotDealNotification[] = notifications.map(rawNotification => {
            return {
              id: rawNotification.id,
              SKU: rawNotification.data.SKU,
              title: this.translation.currentLang === 'fr' ? rawNotification.headings.fr ? rawNotification.headings.fr : rawNotification.headings.en : rawNotification.headings.en,
              content: this.translation.currentLang === 'fr' ? rawNotification.contents.fr ? rawNotification.contents.fr : rawNotification.contents.en : rawNotification.contents.en,
              timestamp: rawNotification.completed_at
            };
          });
          resolve(parsedNotifications);
        } else {
          resolve();
        }
      });
    });
  }
}
