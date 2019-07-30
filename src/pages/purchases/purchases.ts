import { Component, ViewChild } from '@angular/core';
import { PurchasesProvider } from '../../providers/purchases/purchases';
import { Purchase } from '../../interfaces/models/purchase';
import { PurchaseDetailsPage } from '../purchase-details/purchase-details';
import { NavigatorService } from '../../services/navigator/navigator';
import { LoadingService } from '../../services/loading/loading';
import { InfiniteScroll, Content, Events } from 'ionic-angular';
import * as Strings from '../../util/strings';
import * as Constants from '../../util/constants';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'page-purchases',
  templateUrl: 'purchases.html'
})
export class PurchasesPage {

  private purchasesBuffer: Purchase[] = [];
  public purchases: Purchase[] = [];
  private readonly loader: LoadingService; // TODO: Get rid of LS references per trello task

  @ViewChild(Content) private readonly content: Content;
  @ViewChild(InfiniteScroll) private readonly infiniteScroll: InfiniteScroll;

  constructor(private readonly navigatorService: NavigatorService,
    private readonly purchasesProvider: PurchasesProvider,
    private readonly loadingService: LoadingService,
    private readonly translateService: TranslateService,
    private readonly events: Events) {
    this.loader = this.loadingService.createLoader();
  }

  public ngOnInit(): void {
    this.events.subscribe(Constants.EVENT_LOADING_FAILED, this.reloadMethodHandler);
    this.initPurchases();
  }

  private readonly reloadMethodHandler = (culprit?: string): void => {
    this.infiniteScroll.enable(false);
    if (culprit === 'purchases' || !culprit) {
      this.initPurchases();
      // this.navigatorService.performRefresh();
    }
  }
  
  private initPurchases(): void {
    this.purchases = [];
    this.purchasesBuffer = [];
    this.content.resize();
    
   this.infiniteScroll.enable(true);
    this.purchasesProvider.getPurchases().then(purchases => {
      purchases.map(purchase => {
        if (!purchase.program_name) {
          purchase.program_name = (this.translateService.instant(Strings.REGULAR_CATALOG) as String).toUpperCase();
        }
      });

      
      this.purchasesBuffer.push(...purchases);
      this.purchases.push(...this.purchasesBuffer.splice(0, Constants.INFINITE_LOADER_INITIAL_ELEMENTS));
      this.content.resize();
      

      // HACK: Infinite loader was buggy and didn't update sizes properly
      // To fix the issues, we manually check for scroll area size and load enough items
      // The timeout is needed to allow this.content. sizes to update.
      const loadInterval: number = setInterval(() => {
        if (this.content.contentHeight * 2 <= this.content.scrollHeight || this.purchasesBuffer.length === 0) {
          this.loader.hide();
          clearInterval(loadInterval);
          return;
        }
        this.infiniteScroll.ionInfinite.emit(this.infiniteScroll);
      }, 20);
              
    }).catch(err => {
      LoadingService.hideAll();
     // this.reloadService.paintDirty('purchases');
    });

  }

  public openOrderDetails(purchase: Purchase): void {
    this.navigatorService.push(PurchaseDetailsPage, { 'purchase': purchase }).catch(err => console.error(err));
  }

  public loadData(infiniteLoader: InfiniteScroll): void {
      this.purchases.push(...this.purchasesBuffer.splice(0, Constants.INFINITE_LOADER_LOAD_COUNT));
      this.content.resize();
      infiniteLoader.complete();

      if (this.purchasesBuffer.length === 0) {
        infiniteLoader.enabled = false;
      }
  }
}
