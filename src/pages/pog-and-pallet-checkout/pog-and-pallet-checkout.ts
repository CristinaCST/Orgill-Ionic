import { Component } from '@angular/core';
import { NavParams } from 'ionic-angular';
import * as Constants from '../../util/constants';
import * as Strings from '../../util/strings';
import { PopoverContent, PopoversService } from '../../services/popovers/popovers';
import { LoadingService } from '../../services/loading/loading';
import { MarketProvider } from '../../providers/market/market';
import { NavigatorService } from '../../services/navigator/navigator';
import { LandingPage } from '../../pages/landing/landing';
import { UserInfoService } from '../../services/user-info/user-info';

@Component({
  selector: 'page-pog-and-pallet-checkout',
  templateUrl: 'pog-and-pallet-checkout.html'
})
export class POGandPalletCheckoutPage {
  public isPOG: boolean;
  public selectedList: any;
  public customerPO: string;
  public releaseDate: string;
  public minDate: string;
  public maxDate: string;
  public customerLocations = [];
  public selectedLocation: any;
  private readonly loader: LoadingService;
  public popoverContent: PopoverContent = {
    type: Constants.POPOVER_INFO,
    title: Strings.GENERIC_MODAL_TITLE,
    message: Strings.POPOVER_PLACEHOLDER_MESSAGE,
    positiveButtonText: Strings.MODAL_BUTTON_OK
  };

  constructor(
    private readonly navParams: NavParams,
    private readonly popoversService: PopoversService,
    private readonly loading: LoadingService,
    private readonly marketProvider: MarketProvider,
    public navigatorService: NavigatorService,
    private readonly userInfoProvider: UserInfoService
  ) {
    this.loader = this.loading.createLoader();
  }

  ionViewDidEnter() {
    const isPOG = this.navParams.get('isPOG');
    const selectedList = this.navParams.get('selectedList');

    this.isPOG = isPOG;
    this.selectedList = selectedList;

    this.setDateTimeLimits();
    this.getCustomerLocations();
  }

  public getCustomerLocations(): void {
    this.userInfoProvider
      .getUserLocations()
      .take(1)
      .subscribe((locations: any) => {
        if (!locations.length) {
          return;
        }

        this.customerLocations = locations;
        this.selectedLocation = locations[0];

        this.loader.hide();
      });
  }

  public setDateTimeLimits(): void {
    const today = new Date();
    const nextYear = new Date();
    nextYear.setFullYear(today.getFullYear() + 1);

    this.minDate = today.toISOString().split('T')[0];
    this.maxDate = nextYear.toISOString().split('T')[0];
  }

  private handleDateError(): void {
    this.popoverContent.message = 'Please input valid Release Date';
    this.popoversService.show(this.popoverContent);
  }

  private handleCustomerPOError(): void {
    this.popoverContent.message = 'Please input valid Customer PO';
    this.popoversService.show(this.popoverContent);
  }

  private handleCheckoutSuccsess(): void {
    this.popoverContent.message = 'Checkout successful';
    this.popoversService.show(this.popoverContent);
    this.loader.hide();
    this.navigatorService.setRoot(LandingPage);
  }

  private handleCheckoutError(err): void {
    console.error(err);
    this.popoverContent.message = 'Checkout failed';
    this.popoversService.show(this.popoverContent);
    this.loader.hide();
  }

  private handlePOGcheckout(): void {
    this.marketProvider
      .checkoutPOGtoMarketShoppingList(this.selectedList.group_number, {
        customer_po: this.customerPO ? this.customerPO : "",
        release_date: new Date().toISOString().split('T')[0],
        customer_number: this.selectedLocation.shiptono
      })
      .then(() => {
        this.handleCheckoutSuccsess();
      })
      .catch(error => {
        this.handleCheckoutError(error);
      });
  }

  private handlePalletCheckout(): void {
    this.marketProvider
      .checkoutPalletToMarketShoppingList(this.selectedList.palletid, {
        customer_po: this.customerPO ? this.customerPO : "",
        release_date: this.releaseDate,
        customer_number: this.selectedLocation.shiptono
      })
      .then(() => {
        this.handleCheckoutSuccsess();
      })
      .catch(error => {
        this.handleCheckoutError(error);
      });
  }

  public handleCheckout(): void {
    if (!this.customerPO && this.selectedLocation.po_required == "Y") {
      this.handleCustomerPOError();
      return;
    }
    if (!this.isPOG && !this.releaseDate) {
      this.handleDateError();
      return;
    }
    this.loader.show();

    if (this.isPOG) {
      this.handlePOGcheckout();
    } else {
      this.handlePalletCheckout();
    }
  }
}
