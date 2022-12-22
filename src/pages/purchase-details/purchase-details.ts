import { Component, OnInit } from '@angular/core';
import { PurchasesProvider } from '../../providers/purchases/purchases';
import { Purchase } from '../../interfaces/models/purchase';
import { NavParams } from 'ionic-angular';
import { ProductPage } from '../product/product';
import { NavigatorService } from '../../services/navigator/navigator';
import { getNavParam } from '../../helpers/validatedNavParams';
import { PurchasedItem } from '../../interfaces/models/purchased-item';
import { LoadingService } from '../../services/loading/loading';
import { Product } from '../../interfaces/models/product';

@Component({
  selector: 'page-purchase-details',
  templateUrl: 'purchase-details.html'
})
export class PurchaseDetailsPage implements OnInit {
  public purchase: Purchase;
  public purchase_items: PurchasedItem[];
  private readonly loader: LoadingService;

  constructor(
    private readonly purchasesProvider: PurchasesProvider,
    private readonly navParams: NavParams,
    private readonly navigatorService: NavigatorService,
    private readonly loadingService: LoadingService
  ) {
    this.loader = this.loadingService.createLoader();
  }

  public ngOnInit(): void {
    this.loader.show();
    this.purchase = getNavParam(this.navParams, 'purchase', 'object');
    this.purchasesProvider
      .getPurchasedItems(this.purchase.id)
      .then(res => {
        this.loader.hide();
        this.purchase_items = res;
      })
      .catch(err => {
        this.loader.hide();
      });
  }

  public onClickToDetails($event: { product: Product; program_number: string }): void {
    console.log('$event', $event);
    this.navigatorService
      .push(ProductPage, {
        product: $event.product,
        programNumber: $event.program_number
      })
      .catch(err => console.error(err));
  }
}
