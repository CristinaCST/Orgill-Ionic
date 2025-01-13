import { NavParams } from 'ionic-angular';
import { LoadingService } from '../../services/loading/loading';
import { NavigatorService } from '../../services/navigator/navigator';
import { Component } from '@angular/core';
import { MarketProvider } from '../../providers/market/market';

@Component({
  selector: 'page-pog-and-pallet-order-details',
  templateUrl: 'pog-and-pallet-order-details.html'
})
export class POGandPalletOrderDetailsPage {
  public isPOG: boolean;
  public orderDetails: any;

  private readonly loader: LoadingService;

  constructor(
    private readonly marketProvider: MarketProvider,
    private readonly navParams: NavParams,
    private readonly loading: LoadingService,
    public navigatorService: NavigatorService
  ) {
    this.loader = this.loading.createLoader();
  }

  public ionViewDidEnter(): void {
    const isPOG = this.navParams.get('isPOG');
    this.isPOG = isPOG;

    const details = this.navParams.get('details');

    this.loader.show();
    if (isPOG) {
      this.getPOGOrderDetails(details.order_id);
    } else {
      this.getPalletsOrderDetails(details.order_id);
    }
  }

  private getPOGOrderDetails(id: string): void {
    this.marketProvider
      .getPOGSingleOrder(id)
      .then(response => {
        this.orderDetails = response;
        this.loader.hide();
      })
      .catch(err => {
        console.error(err);
        this.loader.hide();
      });
  }

  private getPalletsOrderDetails(id: string): void {
    this.marketProvider
      .getPalletSingleOrder(id)
      .then(response => {
        this.orderDetails = response;
        this.loader.hide();
      })
      .catch(err => {
        console.error(err);
        this.loader.hide();
      });
  }
}
