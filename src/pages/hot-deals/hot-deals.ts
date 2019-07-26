import { Component, ViewChild } from '@angular/core';
import { HotDealNotification } from '../../interfaces/models/hot-deal-notification';
import { HotDealsService } from '../../services/hotdeals/hotdeals';
import { LoadingService } from '../../services/loading/loading';
import { InfiniteScroll, Content } from 'ionic-angular';

@Component({
  selector: 'hot-deals',
  templateUrl: 'hot-deals.html'
})
export class HotDealsPage {
  private readonly hotDealsBuffer: HotDealNotification[] = [];
  private readonly hotDeals: HotDealNotification[] = [];
  private readonly simpleLoader: LoadingService;
  private readonly INITIAL_ELEMENTS: number = 9;  // TODO: CHange to constants
  private readonly LOAD_MORE_COUNT: number = 10;  // TODO: Change to constants

  @ViewChild(Content) private readonly content: Content;

  constructor(private readonly hotDealsService: HotDealsService,
    private readonly loadingService: LoadingService) {
    this.simpleLoader = loadingService.createLoader();
  }

  public ngOnInit(): void {
    this.simpleLoader.show();
    this.hotDealsService.getHotDealNotifications().then(res => {
      this.hotDealsBuffer.push(...res);
      this.hotDeals.push(...this.hotDealsBuffer.splice(0,this.INITIAL_ELEMENTS));
      this.simpleLoader.hide();
    }).catch(err => {
      console.error(err);
      LoadingService.hideAll();
    });

  }

  public clickOnDeal(notification: HotDealNotification): void {
    this.hotDealsService.navigateToHotDeal(notification.SKU.replace('\'',''));
  }

  public loadData(infiniteLoader: InfiniteScroll): void {
    this.hotDeals.push(...this.hotDealsBuffer.splice(0, this.LOAD_MORE_COUNT));
    this.content.resize();
    infiniteLoader.complete();

    // App logic to determine if all data is loaded
    // and disable the infinite scroll
    if (this.hotDealsBuffer.length === 0) {
      infiniteLoader.enabled = false;
    }
  }

}
