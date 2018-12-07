import {Injectable} from '@angular/core';
import {DatabaseProvider} from "../database/database";
import {MyApp} from "../../app/app.component";
import {Purchase} from "../../interfaces/models/purchase";
import {Program} from "../../interfaces/models/program";

@Injectable()
export class PurchasesProvider {

  constructor(private databaseProvider: DatabaseProvider) {

  }


  getLocalPurchasingHistory() {
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


  getLocalPurchaseDetail(purchaseId){
    //TODO
  }

}
