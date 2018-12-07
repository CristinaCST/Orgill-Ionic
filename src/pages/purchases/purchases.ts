import {Component, OnInit} from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import {LocalStorageHelper} from "../../helpers/local-storage-helper";
import {PurchasesProvider} from "../../providers/purchases/purchases";
import {Purchase} from "../../interfaces/models/purchase";
import {PurchaseDetailsPage} from "../purchase-details/purchase-details";

@Component({
  selector: 'page-purchases',
  templateUrl: 'purchases.html',
})
export class PurchasesPage implements OnInit{

  userToken: string;
  purchases: Array<Purchase> = [];

  constructor(public navCtrl: NavController, public navParams: NavParams, public purchasesProvider : PurchasesProvider) {
  }

  ngOnInit() {
    this.purchasesProvider.getLocalPurchasingHistory().then((data : Array<Purchase>)  => {
      this.purchases = data;
    }) ;
  }

  openOrderDetails(purchase: Purchase) {
    this.navCtrl.push(PurchaseDetailsPage, {'purchase': purchase});
  }


}
