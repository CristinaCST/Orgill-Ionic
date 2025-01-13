import { Component } from '@angular/core';
import { NavParams } from 'ionic-angular';
import { TranslateWrapperService } from '../../services/translate/translate';
import { PALLETS_SHOPPING_CART, PLANOGRAMS_SHOPPING_CART } from '../../util/strings';
import { LoadingService } from '../../services/loading/loading';
import { MarketProvider } from '../../providers/market/market';
import * as Constants from '../../util/constants';
import * as Strings from '../../util/strings';
import { PopoverContent, PopoversService } from '../../services/popovers/popovers';
import { NavigatorService } from '../../services/navigator/navigator';
import { POGandPalletSearchPage } from '../../pages/pog-and-pallet-search/pog-and-pallet-search';
import { POGandPalletCheckoutPage } from '../../pages/pog-and-pallet-checkout/pog-and-pallet-checkout';

@Component({
  selector: 'page-pog-and-pallet-list',
  templateUrl: 'pog-and-pallet-list.html'
})
export class POGandPalletListPage {
  public listItems: any[] = [];
  public selectedList: any;
  public isPOG: boolean;
  public pageTitle: string;
  public popoverContent: PopoverContent = {
    type: Constants.POPOVER_INFO,
    title: Strings.GENERIC_MODAL_TITLE,
    message: Strings.POPOVER_PLACEHOLDER_MESSAGE,
    positiveButtonText: Strings.MODAL_BUTTON_OK
  };

  private readonly loader: LoadingService;

  constructor(
    private readonly navParams: NavParams,
    private readonly translateProvider: TranslateWrapperService,
    private readonly loading: LoadingService,
    private readonly marketProvider: MarketProvider,
    private readonly popoversService: PopoversService,
    public navigatorService: NavigatorService
  ) {
    this.loader = this.loading.createLoader();
  }

  public ionViewDidEnter(): void {
    const isPOG = this.navParams.get('isPOG');
    this.isPOG = isPOG;
    this.pageTitle = this.translateProvider.translate(isPOG ? PLANOGRAMS_SHOPPING_CART : PALLETS_SHOPPING_CART);

    this.loader.show();
    if (isPOG) {
      this.getPOGShoppingLists();
    } else {
      this.getPalletsShoppingLists();
    }
  }

  public ionViewWillLeave(): void {
    this.loader.hide();
  }

  private getPOGShoppingLists(): void {
    this.marketProvider
      .getPOGShoppingLists()
      .then(data => {
        this.listItems = data;
        this.loader.hide();
        if (data.length) {
          const [firstItem] = data;
          this.selectedList = firstItem.groupNumber;
        }
      })
      .catch(err => {
        console.error(err);
        this.loader.hide();
      });
  }

  private getPalletsShoppingLists(): void {
    this.marketProvider
      .getPalletsShoppingLists()
      .then(data => {
        this.listItems = data;
        this.loader.hide();
        if (data.length) {
          const [firstItem] = data;
          this.selectedList = firstItem.palletID;
        }
      })
      .catch(err => {
        console.error(err);
        this.loader.hide();
      });
  }

  private selectListWarning(): void {
    this.popoverContent.message = 'No list selected. Please select a list.';
    this.popoversService.show(this.popoverContent);
  }

  private handleRemoveSuccess(): void {
    this.popoverContent.message = 'List removed successfully';
    this.popoversService.show(this.popoverContent);
    this.loader.hide();
    this.listItems = this.listItems.filter(
      item => (this.isPOG ? item.groupNumber : item.palletID) !== this.selectedList
    );
  }

  private handleRemoveError(error): void {
    console.error(error);
    this.popoverContent.message = 'Could not remove list';
    this.popoversService.show(this.popoverContent);
    this.loader.hide();
  }

  private handleRemoveList(): void {
    this.loader.show();
    if (this.isPOG) {
      this.marketProvider
        .deletePOGtoMarketShoppingList(this.selectedList)
        .then(() => this.handleRemoveSuccess())
        .catch(err => this.handleRemoveError(err));
    } else {
      this.marketProvider
        .deletePalletToMarketShoppingList(this.selectedList)
        .then(() => this.handleRemoveSuccess())
        .catch(err => this.handleRemoveError(err));
    }
  }

  public removeList(): void {
    if (!this.selectedList) {
      this.selectListWarning();
      return;
    }

    this.popoverContent.message = 'Are you sure you want to remove this list?';
    this.popoverContent.dismissButtonText = Strings.MODAL_BUTTON_CANCEL;
    this.popoversService.show(this.popoverContent).subscribe(data => {
      if (data.optionSelected === 'OK') {
        this.popoverContent.dismissButtonText = undefined;
        this.handleRemoveList();
      }
    });
  }

  private getListQuantity(): number {
    return this.getSelectedList().qty;
  }

  public editList(): void {
    if (!this.selectedList) {
      this.selectListWarning();
      return;
    }

    this.navigatorService.push(POGandPalletSearchPage, {
      isPOG: this.isPOG,
      searchString: this.selectedList,
      isEdit: true,
      quantity: this.getListQuantity()
    });
  }

  private getSelectedList(): any {
    return this.listItems.find(item => (this.isPOG ? item.groupNumber : item.palletID) === this.selectedList);
  }

  public goToCheckout(): void {
    if (!this.selectedList) {
      this.selectListWarning();
      return;
    }

    this.navigatorService.push(POGandPalletCheckoutPage, {
      isPOG: this.isPOG,
      selectedList: this.getSelectedList()
    });
  }
}
