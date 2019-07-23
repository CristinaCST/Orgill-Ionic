import { Injectable, NgZone } from '@angular/core';
import * as ConstantsUrl from '../../util/constants-url';
import * as Constants from '../../util/constants';
import { ApiService } from '../api/api';
import { LocalStorageHelper } from '../../helpers/local-storage';
import { NavOptions, Events } from 'ionic-angular';
import { ProductPage } from '../../pages/product/product';
import { NavigatorService } from '../navigator/navigator';
import { Observable } from 'rxjs';
import { APIResponse } from '../../interfaces/response-body/response';
import { Product } from '../../interfaces/models/product';
import { AuthService } from '../../services/auth/auth';

@Injectable()
export class HotDealService {

  constructor(private readonly apiProvider: ApiService,
    private readonly navigatorService: NavigatorService,
    private readonly events: Events,
    private readonly apiService: ApiService,
    private readonly authService: AuthService,
    private readonly ngZone: NgZone) { }

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

        this.ngZone.run(()=>{
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

}
