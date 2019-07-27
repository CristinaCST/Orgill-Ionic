import { Component, ViewChild } from '@angular/core';
import { PurchasesProvider } from '../../providers/purchases/purchases';
import { Purchase } from '../../interfaces/models/purchase';
import { PurchaseDetailsPage } from '../purchase-details/purchase-details';
import { NavigatorService } from '../../services/navigator/navigator';
import { LoadingService } from '../../services/loading/loading';
import { InfiniteScroll, Content } from 'ionic-angular';
import * as Strings from '../../util/strings';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'page-purchases',
  templateUrl: 'purchases.html'
})
export class PurchasesPage {

  private readonly purchasesBuffer: Purchase[] = [];
  public purchases: Purchase[] = [];
  private readonly loader: LoadingService; // TODO: Get rid of LS references per trello task
  private readonly INITIAL_ELEMENTS: number = 9;  // TODO: CHange to constants
  private readonly LOAD_MORE_COUNT: number = 10;  // TODO: Change to constants

  @ViewChild(Content) private readonly content: Content;

  constructor(private readonly navigatorService: NavigatorService,
    private readonly purchasesProvider: PurchasesProvider,
    private readonly loadingService: LoadingService,
    private readonly translateService: TranslateService) {
    this.loader = this.loadingService.createLoader();
  }

  public ngOnInit(): void {
    this.loader.show();
    
    this.purchasesProvider.getPurchases().then(purchases => {
      purchases.map(purchase => {
        if (!purchase.program_name) {
          purchase.program_name = (this.translateService.instant(Strings.REGULAR_CATALOG) as String).toUpperCase();
        }
      });
      this.loader.hide();
      this.purchasesBuffer.push(...purchases);
      this.purchases.push(...this.purchasesBuffer.splice(0, this.INITIAL_ELEMENTS));
    }).catch(err => {
      this.loader.hide();
    });
  }

  public openOrderDetails(purchase: Purchase): void {
    this.navigatorService.push(PurchaseDetailsPage, { 'purchase': purchase }).catch(err => console.error(err));
  }

  public loadData(infiniteLoader: InfiniteScroll): void {
    this.purchases.push(...this.purchasesBuffer.splice(0, this.LOAD_MORE_COUNT));
    this.content.resize();
    infiniteLoader.complete();

    // App logic to determine if all data is loaded
    // and disable the infinite scroll
    if (this.purchasesBuffer.length === 0) {
      infiniteLoader.enabled = false;
    }
  }
}
