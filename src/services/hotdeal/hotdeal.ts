import { Injectable } from '@angular/core';
import * as ConstantsUrl from '../../util/constants-url';
import * as Constants from '../../util/constants';
import { ApiService } from '../api/api';
import { LocalStorageHelper } from '../../helpers/local-storage';
import { NavOptions, Events } from 'ionic-angular';
import { ProductPage } from '../../pages/product/product';
import { NavigatorService } from '../navigator/navigator';
import { Observable } from 'rxjs';
import { APIResponse } from '../../interfaces/response-body/response';
import { empty } from 'rxjs/observable/empty';
import { Product } from '../../interfaces/models/product';
import { AuthService } from '../../services/auth/auth';

@Injectable()
export class HotDealService {

  constructor(private readonly apiProvider: ApiService,
              private readonly navigatorService: NavigatorService,
              private readonly events: Events,
              private readonly apiService: ApiService,
              private readonly authService: AuthService) {}

  private getHotDealsProduct(sku: string = ''): Observable<APIResponse> {

  /*  let params = {
      'user_token': this.userToken,
      'sku': sku
    };

    return this.apiProvider.post(ConstantsUrl.GET_HOTDEALS_PRODUCT, params);*/
    // HACK: Replacement for not working backend


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

  public navigateToHotDeal(sku: string = ''): void {
    this.getHotDealsProduct(sku).subscribe(receivedResponse => {
      const responseData: Product[] = JSON.parse(receivedResponse.d);
      if (responseData.length > 0) {
        responseData.filter(item => item.SKU === sku);
        const hotDeal: any = {
          isHotDeal: true,
          SKU: sku,
          product: responseData[0]
        };

        // HACK: To fix this error
        this.navigatorService.push(ProductPage, hotDeal, { paramsEquality: false } as NavOptions).catch(err => console.error(err));
      }
    });

  }


  public isHotDealExpired(timestamp: string = ''): boolean {
    const dateString: string = timestamp ? timestamp : LocalStorageHelper.getFromLocalStorage(Constants.ONE_SIGNAL_PAYLOAD_TIMESTAMP);
    const hotDealTimestamp: Date = new Date(parseInt(dateString, 10));

    if ((new Date()).getDay() !== hotDealTimestamp.getDay()) {
      this.markHotDealExpired();
      return true;
    }
    return false;
  }

  public markHotDealExpired(): void {
    LocalStorageHelper.removeFromLocalStorage(Constants.ONE_SIGNAL_HOT_DEAL_SKU_PATH);
    this.events.publish(Constants.HOT_DEAL_EXPIRED_EVENT);
  }

  public checkHotDealState(sku: string): boolean {
    const hotDealSku: string = sku ? sku : LocalStorageHelper.getFromLocalStorage(Constants.ONE_SIGNAL_HOT_DEAL_SKU_PATH);
    return hotDealSku && !this.isHotDealExpired() ? true : false;
  }

  public getHotDealProgram(sku: string): Observable<APIResponse> {
  const params: any = {
    user_token: this.authService.userToken,
    sku: sku
  };

  if (params.user_token) {
      return this.apiService.post(ConstantsUrl.GET_HOTDEALS_PROGRAM, params);
    }
  return empty<APIResponse>();
  }

/*
  orderHotDeal(itemsIdsArr, shoppingListId) {

    let productListInfo = {
      order_method: ???
      order_query: this.getOrderQuery(programNumber, orderItems)
    };

    let insertToDBInfo = {
      PO: this.postOffice,
      date: moment().format('MM/DD/YYYY'),
      location: this.location.SHIPTONO,
      type: this.orderMethod,
      total: this.orderTotal,
      program_number: programNumber
    };


    return new Promise((resolve, reject) => {
        productInfoList.user_token = this.userToken;
        try {
          this.apiProvider.post(ConstantsUrl.URL_SHOPPING_LISTS_ORDER_PRODUCTS, productInfoList).subscribe(async (response) => {
            if (response) {
              insertToDBInfo.confirmation_number = JSON.parse(response.d);
              let insertedPurchaseToDBInfo = await this.insertPurchaseToDB(insertToDBInfo);
              let removedItemsFromShoppingList = await this.deleteItemsFromList(insertedPurchaseToDBInfo.insertId, itemsIdsArr, shoppingListId);
              resolve({
                insertedPurchaseToDBInfo: insertedPurchaseToDBInfo, confirmationNumber: JSON.parse(response.d),
                removedItemsFromShoppingList: removedItemsFromShoppingList
              });
            } else {
              reject(response);
            }
          })
        } catch (e) {
          reject(e);
        }
      }
    )
  }

  insertPurchaseToDB(purchaseInfo) {
    return this.databaseProvider.insertPurchase(purchaseInfo);
  }

  deleteItemsFromList(insertId, itemsIdsArr, shoppingListId) {
    return this.databaseProvider.finalizePurchase(insertId, itemsIdsArr, shoppingListId);
  }
*/

}
