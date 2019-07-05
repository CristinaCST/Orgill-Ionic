import { Component, OnInit } from '@angular/core';
import { PurchasesProvider } from '../../providers/purchases/purchases';
import { Purchase } from '../../interfaces/models/purchase';
import { NavParams } from 'ionic-angular';
import { ShoppingListItem } from '../../interfaces/models/shopping-list-item';
import { ProductPage } from '../product/product';
import { NavigatorService } from '../../services/navigator/navigator';
import { getNavParam } from '../../helpers/validatedNavParams';


@Component({
  selector: 'page-purchase-details',
  templateUrl: 'purchase-details.html'
})
export class PurchaseDetailsPage implements OnInit {
  public purchase: Purchase;

  constructor(public purchasesProvider: PurchasesProvider,
              public navParams: NavParams, public navigatorService: NavigatorService) {
  }

  public ngOnInit(): void {
    this.purchase = getNavParam(this.navParams, 'purchase', 'object');
  //  this.getLocalPurchaseItems();
  }

  // public getLocalPurchaseItems(): void {
  //   this.purchasesProvider.getAllProductsFromPurchase(this.purchase.purchase_id).then(
  //     (data: ShoppingListItem[]) =>
  //       this.purchase.purchase_items = data);
  // }

  public onCheckedToDetails($event: { product: string, program_number: string, id: string, quantity: string }): void {
    this.navigatorService.push(ProductPage, {
      product: $event.product,
      programNumber: $event.program_number,
      id: $event.id,
      quantity: $event.quantity
    }).catch(err => console.error(err));
  }

}
