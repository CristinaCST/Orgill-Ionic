import {Component, OnInit} from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import {PurchasesProvider} from "../../providers/purchases/purchases";


@Component({
  selector: 'page-purchase-details',
  templateUrl: 'purchase-details.html',
})
export class PurchaseDetailsPage implements  OnInit{

  constructor(public navCtrl: NavController, public navParams: NavParams, public purchaseProvider : PurchasesProvider) {

  }

  ngOnInit(){
    this.getLocalPurchaseItems();
  }

  getLocalPurchaseItems(){
      //TODO: use PurchaseProvider
  }


}
