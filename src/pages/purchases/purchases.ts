import {Component} from '@angular/core';
import { NavParams} from 'ionic-angular';
import {PurchasesProvider} from "../../providers/purchases/purchases";
import {Purchase} from "../../interfaces/models/purchase";
import {PurchaseDetailsPage} from "../purchase-details/purchase-details";
import { NavigatorService } from '../../services/navigator/navigator';

@Component({
  selector: 'page-purchases',
  templateUrl: 'purchases.html',
})
export class PurchasesPage {

  userToken: string;
  purchases: Array<Purchase> = [];

  constructor(public navigatorService: NavigatorService, public navParams: NavParams, public purchasesProvider: PurchasesProvider) {
  }

  ngOnInit() {
    this.purchasesProvider.getLocalPurchaseHistory().then((data: Array<Purchase>) => {
      if (data) {
        this.purchases = data;
      }
    });
  }

  openOrderDetails(purchase: Purchase) {
    this.navigatorService.push(PurchaseDetailsPage, {'purchase': purchase}).catch(err => console.error(err));
  }

}
