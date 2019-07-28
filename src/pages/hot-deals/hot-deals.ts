import { Component, ViewChild } from '@angular/core';
import { HotDealNotification } from '../../interfaces/models/hot-deal-notification';
import { HotDealsService } from '../../services/hotdeals/hotdeals';
import { LoadingService } from '../../services/loading/loading';
import { InfiniteScroll, Content } from 'ionic-angular';
import * as Constants from '../../util/constants';

@Component({
  selector: 'hot-deals',
  templateUrl: 'hot-deals.html'
})
export class HotDealsPage {
  private readonly hotDealsBuffer: HotDealNotification[] = [];
  private readonly hotDeals: HotDealNotification[] = [];
  private readonly simpleLoader: LoadingService;

  @ViewChild(Content) private readonly content: Content;
  @ViewChild(InfiniteScroll) private readonly infiniteScroll: InfiniteScroll;

  constructor(private readonly hotDealsService: HotDealsService,
    private readonly loadingService: LoadingService) {
    this.simpleLoader = this.loadingService.createLoader();
  }

  public ngOnInit(): void {
    this.simpleLoader.show();
    this.hotDealsService.getHotDealNotifications().then(res => {

      this.hotDealsBuffer.push(...res);
      this.hotDeals.push(...this.hotDealsBuffer.splice(0, Constants.INFINITE_LOADER_INITIAL_ELEMENTS));
      this.content.resize();

       // HACK: Infinite loader was buggy and didn't update sizes properly
      // To fix the issues, we manually check for scroll area size and load enough items
      // The timeout is needed to allow this.content. sizes to update.
      const loadInterval: number = setInterval(() => {
        if (this.content.contentHeight * 2 <= this.content.scrollHeight || this.hotDealsBuffer.length === 0) {
          this.simpleLoader.hide();
          clearInterval(loadInterval);
          return;
        }
        this.infiniteScroll.ionInfinite.emit(this.infiniteScroll);
      }, 20);

    }).catch(err => {
      console.error(err);
      LoadingService.hideAll();
    });

  }

  public clickOnDeal(notification: HotDealNotification): void {
    this.hotDealsService.navigateToHotDeal(notification.SKU.replace('\'', ''));
  }

  public loadData(infiniteLoader: InfiniteScroll): void {
    this.hotDeals.push(...this.hotDealsBuffer.splice(0, Constants.INFINITE_LOADER_LOAD_COUNT));
    this.content.resize();
    infiniteLoader.complete();

    if (this.hotDealsBuffer.length === 0) {
      infiniteLoader.enabled = false;
    }
  }

}
