import { Injectable } from '@angular/core';
import { ApiService } from '../../services/api/api';
import { Purchase } from '../../interfaces/models/purchase';
import * as ConstantsUrl from '../../util/constants-url';
import * as Constants from '../../util/constants';
import { AuthService } from '../../services/auth/auth';
import { APIResponse } from '../../interfaces/response-body/response';
import { PurchasedItem } from 'interfaces/models/purchased-item';

@Injectable()
export class PurchasesProvider {
  constructor(private readonly apiService: ApiService,
              private readonly authService: AuthService) { }

  public getPurchases(): Promise<Purchase[]> {
    return new Promise<Purchase[]>(resolve => {
      this.apiService.post(ConstantsUrl.USER_PAST_PURCHASES, { user_token: this.authService.getUserToken() }).subscribe((response: APIResponse) => {
        if (!response) {
          resolve([]);
        }

        // Handle placeolders for development, can remove this code after feature is complete
        if (Constants.PAST_PURCHASES_DEBUG_PLACEHOLDERS) {
          resolve(JSON.parse(response.d).map((purchase: Purchase) => {
            const parsedPurchase: Purchase = purchase;
            if (!purchase.confirmation) {
              parsedPurchase.confirmation = Constants.PAST_PURCHASES_DEBUG_ORDER_PLACEHOLDER;
            }
            if (!purchase.date) {
              parsedPurchase.date = Constants.PAST_PURCHASES_DEBUG_DATE_PLACEHOLDER;
            }
            if (!purchase.total) {
              parsedPurchase.total = Constants.PAST_PURCHASES_DEBUG_TOTAL_PLACEHOLDER;
            }
            return parsedPurchase;
          }));
        } else {
          resolve(JSON.parse(response.d) as Purchase[]);
        }
      });
    });
  }

  public getPurchasedItems(order_id: string): Promise<PurchasedItem[]> {
    return new Promise<PurchasedItem[]>(resolve => {
      this.apiService.post(ConstantsUrl.PURCHASE_ITEMS, { user_token: this.authService.getUserToken(), purchase_order_id: order_id }).subscribe((response: APIResponse) => {
        if (!response) {
          resolve([]);
        }
        resolve(JSON.parse(response.d) as PurchasedItem[]);
      });
    });
  }
}
