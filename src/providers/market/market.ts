import { Injectable } from '@angular/core';
import { ApiService } from '../../services/api/api';
import * as ConstantsUrl from '../../util/constants-url';
import { Observable } from 'rxjs';

@Injectable()
export class MarketProvider {
  constructor(private readonly apiProvider: ApiService) {}

  public getPOGShoppingLists(): Promise<any> {
    return this.apiProvider.get(ConstantsUrl.GET_POG_SHOPPING_LISTS).toPromise();
  }

  public getPalletsShoppingLists(): Promise<any> {
    return this.apiProvider.get(ConstantsUrl.GET_PALLETS_SHOPPING_LISTS).toPromise();
  }

  public getPOGbyID(group_number: string): Promise<any> {
    return this.apiProvider.get(`${ConstantsUrl.GET_POG_BY_ID}/${group_number}`, {}).toPromise();
  }

  public getPalletsByID(PalletID: string): Promise<any> {
    return this.apiProvider.get(`${ConstantsUrl.GET_PALLETS_BY_ID}/${PalletID}`, {}).toPromise();
  }

  public addPOGtoMarketShoppingList(group_number: string, qty: number): Promise<any> {
    return this.apiProvider.post(ConstantsUrl.ADD_POG_TO_MARKET_SHOPPING_LIST, { group_number, qty }).toPromise();
  }

  public addPalletToMarketShoppingList(palletID: string, qty: number): Promise<any> {
    return this.apiProvider.post(ConstantsUrl.ADD_PALLET_TO_MARKET_SHOPPING_LIST, { palletID, qty }).toPromise();
  }

  public editPOGtoMarketShoppingList(group_number: string, qty: number): Promise<any> {
    return this.apiProvider.put(ConstantsUrl.ADD_POG_TO_MARKET_SHOPPING_LIST, { group_number, qty }).toPromise();
  }

  public editPalletToMarketShoppingList(palletID: string, qty: number): Promise<any> {
    return this.apiProvider.put(ConstantsUrl.ADD_PALLET_TO_MARKET_SHOPPING_LIST, { palletID, qty }).toPromise();
  }

  public deletePOGtoMarketShoppingList(group_number: string): Promise<any> {
    return this.apiProvider.delete(`${ConstantsUrl.DELETE_POG_TO_MARKET_SHOPPING_LIST}/${group_number}`, {}).toPromise();
  }

  public deletePalletToMarketShoppingList(palletID: string): Promise<any> {
    return this.apiProvider.delete(`${ConstantsUrl.DELETE_PALLET_TO_MARKET_SHOPPING_LIST}/${palletID}`, {}).toPromise();
  }

  public checkoutPOGtoMarketShoppingList(group_number: string, data: any): Promise<any> {
    return fetch(`${this.apiProvider.baseUrl}${ConstantsUrl.CHECKOUT_POG_TO_MARKET_SHOPPING_LIST}/${group_number}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        user_Token: this.apiProvider.userToken
      },
      body: JSON.stringify(data)
    }).then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.text();
    });
  }

  public chekcoutPalletToMarketShoppingList(palletID: string, data: any): Promise<any> {
    return fetch(`${this.apiProvider.baseUrl}${ConstantsUrl.CHECKOUT_PALLET_TO_MARKET_SHOPPING_LIST}/${palletID}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        user_Token: this.apiProvider.userToken
      },
      body: JSON.stringify(data)
    }).then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.text();
    });
  }
}
