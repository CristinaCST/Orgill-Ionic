import {Injectable} from '@angular/core';
import {DatabaseProvider} from "../database/database";
import {Purchase} from "../../interfaces/models/purchase";
import {Program} from "../../interfaces/models/program";
import {ShoppingListItem} from "../../interfaces/models/shopping-list-item";

@Injectable()
export class PurchasesProvider {

  constructor(private databaseProvider: DatabaseProvider) {
  }

  getLocalPurchaseHistory() {
    return new Promise((resolve, reject) =>
      this.databaseProvider.getAllPurchases().then((data) => {
        if (!data.rows) {
          resolve(null);
          return;
        }
        let purchases: Array<Purchase> = [];
        if (data.rows.length > 0) {
          for (let i = 0; i < data.rows.length; i++) {
            const receivedPurchase = data.rows.item(i);

            const itemProgram: Program = {
              PROGRAMNO: receivedPurchase.program_no,
              NAME: receivedPurchase.name,
              STARTDATE: data.start_date,
              ENDDATE: data.end_date,
              SHIPDATE: data.ship_date,
              MARKETONLY: data.market_only,
            };

            const purchase: Purchase = {
              purchase_id: receivedPurchase.id,
              PO: receivedPurchase.po,
              date: receivedPurchase.date,
              location_number: receivedPurchase.location,
              type: receivedPurchase.type,
              total: receivedPurchase.total,
              confirmation_number: receivedPurchase.confirmation_number,
              item_program: itemProgram,
              purchase_items: [],
            };

            purchases.push(purchase);

          }
          resolve(purchases);
        }

      })
        .catch(error => reject(error))
    )
  }


  getAllProductsFromPurchase(purchaseId) {
    return new Promise(async (resolve, reject) => {
        try {
          let data = await this.databaseProvider.getAllProductsFromPurchase(purchaseId);
          let purchaseItems = [];
          if (data) {
            if (data.rows.length > 0) {
              for (let i = 0; i < data.rows.length; i++) {
                let receivedItem = data.rows.item(i);
                let listItem: ShoppingListItem = {
                  id: receivedItem.id,
                  product: {
                    CatID: receivedItem.cat_id,
                    SKU: receivedItem.sku,
                    QTY_ROUND_OPTION: receivedItem.qty_round_option,
                    MODEL: receivedItem.model,
                    NAME: receivedItem.name,
                    VENDOR_NAME: receivedItem.vendor_name,
                    SELLING_UNIT: receivedItem.selling_unit,
                    UPC_CODE: receivedItem.upc_code,
                    SUGGESTED_RETAIL: receivedItem.suggested_retail,
                    YOURCOST: receivedItem.your_cost,
                    IMAGE: receivedItem.image,
                    SHELF_PACK: receivedItem.shelf_pack,
                    VELOCITY_CODE: receivedItem.velocity_code,
                    TOTAL_REC_COUNT: receivedItem.total_rec_count
                  },
                  program_number: receivedItem.program_number,
                  quantity: receivedItem.quantity,
                  item_price: receivedItem.item_price
                };
                purchaseItems.push(listItem)
              }
            }
          }
          resolve(purchaseItems);
        } catch (error) {
          reject(error);
        }
      }
    );
  }

}
