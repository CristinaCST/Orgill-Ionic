import {Component, OnInit} from '@angular/core';
import {PurchasesProvider} from "../../providers/purchases/purchases";
import {Purchase} from "../../interfaces/models/purchase";
import {NavController, NavParams} from "ionic-angular";
import {ShoppingListItem} from "../../interfaces/models/shopping-list-item";
import {ProductPage} from "../product/product";


@Component({
  selector: 'page-purchase-details',
  templateUrl: 'purchase-details.html',
})
export class PurchaseDetailsPage implements OnInit {
  purchase: Purchase;

  constructor(public purchasesProvider: PurchasesProvider, public navParams: NavParams, public navCtrl: NavController) {
  }

  ngOnInit() {
    this.purchase = this.navParams.get('purchase');
    this.getLocalPurchaseItems();
  }

  getLocalPurchaseItems() {
    this.purchasesProvider.getAllProductsFromPurchase(this.purchase.purchase_id).then(
      (data: Array<ShoppingListItem>) =>
        this.purchase.purchase_items = data);
  }

  onCheckedToDetails($event) {
    this.navCtrl.push(ProductPage, {
      product: $event.product,
      programNumber: $event.program_number,
      id: $event.id,
      quantity: $event.quantity
    }).catch(err => console.error(err))
  }

}
