import { NavParams } from 'ionic-angular';
import { LoadingService } from '../../services/loading/loading';
import { NavigatorService } from '../../services/navigator/navigator';
import { TranslateWrapperService } from '../../services/translate/translate';
import { PALLETS_PAST_PURCHASES, PLANOGRAMS_PAST_PURCHASES } from '../../util/strings';
import { Component } from '@angular/core';
import { MarketProvider } from '../../providers/market/market';
import { POGandPalletOrderDetailsPage } from '../../pages/pog-and-pallet-order-details/pog-and-pallet-order-details';

@Component({
  selector: 'page-pog-and-pallet-past-purchases',
  templateUrl: 'pog-and-pallet-past-purchases.html'
})
export class POGandPalletPastPurchasesPage {
  public pageTitle: string;
  public isPOG: boolean;
  public pastPurchases: any[] = [];

  private readonly loader: LoadingService;

  constructor(
    private readonly marketProvider: MarketProvider,
    private readonly navParams: NavParams,
    private readonly translateProvider: TranslateWrapperService,
    private readonly loading: LoadingService,
    public navigatorService: NavigatorService
  ) {
    this.loader = this.loading.createLoader();
  }

  public ionViewDidEnter(): void {
    const isPOG = this.navParams.get('isPOG');
    this.isPOG = isPOG;
    this.pageTitle = this.translateProvider.translate(isPOG ? PLANOGRAMS_PAST_PURCHASES : PALLETS_PAST_PURCHASES);

    this.loader.show();
    if (isPOG) {
      this.getPOGPastPurchases();
    } else {
      this.getPalletsPastPurchases();
    }
  }

  private getPOGPastPurchases(): void {
    this.marketProvider
      .getPOGPastPurchases()
      .then(response => {
        this.pastPurchases = response;
        this.loader.hide();
      })
      .catch(err => {
        console.error(err);
        this.loader.hide();
      });
  }

  private getPalletsPastPurchases(): void {
    this.marketProvider
      .getPalletsPastPurchases()
      .then(response => {
        this.pastPurchases = response;
        this.loader.hide();
      })
      .catch(err => {
        console.error(err);
        this.loader.hide();
      });
  }

  public goToOrderDetailsPage(details: any): void {
    this.navigatorService
      .push(POGandPalletOrderDetailsPage, { isPOG: this.isPOG, details })
      .catch(err => console.error(err));
  }
}
