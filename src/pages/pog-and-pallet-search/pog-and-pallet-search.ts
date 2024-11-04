import { Component } from '@angular/core';
import { NavParams } from 'ionic-angular';
import { LoadingService } from '../../services/loading/loading';
import { MarketProvider } from '../../providers/market/market';
import { PopoverContent, PopoversService } from '../../services/popovers/popovers';
import * as Constants from '../../util/constants';
import * as Strings from '../../util/strings';

@Component({
  selector: 'page-pog-and-pallet-search',
  templateUrl: 'pog-and-pallet-search.html'
})
export class POGandPalletSearchPage {
  public searchData: any;
  public isPOG: boolean = false;
  public isEdit: boolean = false;
  public quantity: number = 1;
  public popoverContent: PopoverContent = {
    type: Constants.POPOVER_INFO,
    title: Strings.GENERIC_MODAL_TITLE,
    message: Strings.POPOVER_PLACEHOLDER_MESSAGE,
    positiveButtonText: Strings.MODAL_BUTTON_OK
  };
  private readonly loader: LoadingService;

  constructor(
    private readonly navParams: NavParams,
    private readonly loading: LoadingService,
    private readonly marketProvider: MarketProvider,
    private readonly popoversService: PopoversService
  ) {
    this.loader = this.loading.createLoader();
  }

  public ionViewWillEnter(): void {
    const isPOG = this.navParams.get('isPOG');
    const searchString = this.navParams.get('searchString');
    const isEdit = this.navParams.get('isEdit');
    const quantity = this.navParams.get('quantity');

    this.isPOG = isPOG;
    this.isEdit = isEdit;
    this.quantity = quantity || 1;

    this.loader.show();
    if (isPOG) {
      this.fetchPOGitems(searchString);
    } else {
      this.fetchPallets(searchString);
    }
  }

  public ionViewWillLeave(): void {
    this.loader.hide();
  }

  public add(): void {
    this.quantity += 1;
  }

  public remove(): void {
    if (this.quantity > 1) {
      this.quantity -= 1;
    }
  }

  private handleAddResponse(): void {
    this.popoverContent.message = `${this.isPOG ? 'Planogram' : 'Pallet'} added to ${
      this.isPOG ? 'Planograms' : 'Pallets'
    } shopping cart`;
    this.popoversService.show(this.popoverContent);
    this.loader.hide();
    this.isEdit = true;
  }

  private handleAddError(error): void {
    this.loader.hide();
    console.error('error', error);
    this.popoverContent.message = `Could not add ${this.isPOG ? 'Planogram' : 'Pallet'}`;
    this.popoversService.show(this.popoverContent);
  }

  public addToShoppingList(): void {
    this.loader.show();

    if (this.isPOG) {
      this.marketProvider
        .addPOGtoMarketShoppingList(
          this.isPOG ? `${this.searchData.groupNumber}` : `${this.searchData.palletID}`,
          this.quantity
        )
        .then(() => {
          this.handleAddResponse();
        })
        .catch(error => {
          this.handleAddError(error);
        });
    } else {
      this.marketProvider
        .addPalletToMarketShoppingList(
          this.isPOG ? `${this.searchData.groupNumber}` : `${this.searchData.palletID}`,
          this.quantity
        )
        .then(() => {
          this.handleAddResponse();
        })
        .catch(error => {
          this.handleAddError(error);
        });
    }
  }

  private handleEditResponse(): void {
    this.popoverContent.message = `${this.isPOG ? 'Planogram' : 'Pallet'} list updated`;
    this.popoversService.show(this.popoverContent);
    this.loader.hide();
  }

  private handleEditError(error): void {
    this.loader.hide();
    console.error('error', error);
    this.popoverContent.message = `Could not update ${this.isPOG ? 'Planogram' : 'Pallet'}`;
    this.popoversService.show(this.popoverContent);
  }

  public editShoppingList(): void {
    this.loader.show();

    if (this.isPOG) {
      this.marketProvider
        .editPOGtoMarketShoppingList(
          this.isPOG ? `${this.searchData.groupNumber}` : `${this.searchData.palletID}`,
          this.quantity
        )
        .then(() => {
          this.handleEditResponse();
        })
        .catch(error => {
          this.handleEditError(error);
        });
    } else {
      this.marketProvider
        .editPalletToMarketShoppingList(
          this.isPOG ? `${this.searchData.groupNumber}` : `${this.searchData.palletID}`,
          this.quantity
        )
        .then(() => {
          this.handleEditResponse();
        })
        .catch(error => {
          this.handleEditError(error);
        });
    }
  }

  private fetchPOGitems(groupNumber) {
    this.marketProvider
      .getPOGbyID(groupNumber)
      .then(response => {
        this.searchData = response;
        this.loader.hide();
      })
      .catch(error => {
        this.loader.hide();
        console.error('error', error);
      });
  }

  private fetchPallets(PalletID) {
    this.marketProvider
      .getPalletsByID(PalletID)
      .then(response => {
        this.searchData = response;
        this.loader.hide();
      })
      .catch(error => {
        console.error('error', error);
        this.loader.hide();
      });
  }
}
