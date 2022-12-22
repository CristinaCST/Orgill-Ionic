import { Injectable } from '@angular/core';
import { ApiService } from '../../services/api/api';
import { Purchase } from '../../interfaces/models/purchase';
import * as ConstantsUrl from '../../util/constants-url';
import * as Constants from '../../util/constants';
import { APIResponse } from '../../interfaces/response-body/response';
import { PurchasedItem } from 'interfaces/models/purchased-item';

@Injectable()
export class PurchasesProvider {
  constructor(private readonly apiService: ApiService) {}

  public getPurchases(): Promise<Purchase[]> {
    return new Promise<Purchase[]>(resolve => {
      this.apiService.get(ConstantsUrl.USER_PAST_PURCHASES).subscribe((response: any) => {
        if (!response) {
          resolve([]);
        }

        const purchases: Purchase[] = response;

        // Handle placeolders for development, can remove this code after feature is complete

        purchases.map((purchase: Purchase) => {
          const parsedPurchase: Purchase = purchase;
          if (Constants.PAST_PURCHASES_DEBUG_PLACEHOLDERS) {
            if (!purchase.confirmation) {
              parsedPurchase.confirmation = Constants.PAST_PURCHASES_DEBUG_ORDER_PLACEHOLDER;
            }
            if (!purchase.purchase_date) {
              parsedPurchase.purchase_date = Constants.PAST_PURCHASES_DEBUG_DATE_PLACEHOLDER;
            }
            if (!purchase.total) {
              parsedPurchase.total = Constants.PAST_PURCHASES_DEBUG_TOTAL_PLACEHOLDER;
            }
          }
          parsedPurchase.purchase_date = purchase.purchase_date.split(' ')[0];
          return parsedPurchase;
        });

        purchases.sort(
          (purchase1, purchase2) =>
            new Date(purchase2.purchase_date).getTime() - new Date(purchase1.purchase_date).getTime()
        );
        resolve(purchases);
      });
    });
  }

  public getPurchasedItems(order_id: string): Promise<PurchasedItem[]> {
    return new Promise<PurchasedItem[]>(resolve => {
      this.apiService.get(`${ConstantsUrl.PURCHASE_ITEMS}/${order_id}`).subscribe((response: any) => {
        if (!response) {
          resolve([]);
        }
        resolve(response);
      });
    });
  }
}
