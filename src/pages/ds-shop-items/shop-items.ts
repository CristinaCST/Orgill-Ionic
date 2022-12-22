import { Component, OnDestroy, OnInit } from '@angular/core';
import { Events, NavController, NavParams } from 'ionic-angular';
import { take } from 'rxjs/operators';
import { DropshipProvider } from '../../providers/dropship/dropship';
import { FormDetails, FormItems, SavedorderItems, SavedorderList } from '../../interfaces/response-body/dropship';
import { LoadingService } from '../../services/loading/loading';
import { DropshipService } from '../../services/dropship/dropship';
import { TranslateWrapperService } from '../../services/translate/translate';
import { loading_text } from '../../util/strings';
import { CheckoutPage } from '../../pages/ds-checkout/checkout';

@Component({
  selector: 'page-shop-items',
  templateUrl: 'shop-items.html'
})
export class ShopItemsPage implements OnInit, OnDestroy {
  public itemList: any;
  public formDetails: FormDetails;
  public isDropship: boolean = false;
  public isOverlayActive: boolean = false;
  public pageTitle: string;
  public checkoutItems: FormDetails;
  public selectedItems: any = [];
  public selectedQuantity: number = 1;
  public imageError: boolean = false;
  public isActiveSearch: boolean = false;
  public isScanActive: boolean = false;
  public currentSearchedKeyword: string = '';
  private readonly dropshipLoader: LoadingService;

  constructor(
    public events: Events,
    public navController: NavController,
    public dropshipProvider: DropshipProvider,
    public loadingService: LoadingService,
    private readonly navParams: NavParams,
    private readonly dropshipService: DropshipService,
    private readonly translateProvider: TranslateWrapperService
  ) {
    this.dropshipLoader = loadingService.createLoader(this.translateProvider.translate(loading_text));

    events.subscribe('searchItems:shop', (searchItems: FormItems[]) => {
      if (!searchItems && !Boolean(searchItems.length)) {
        return;
      }

      if (this.isScanActive) {
        this.isScanActive = false;
        navController.push(CheckoutPage, { searchItems, form_id: this.formDetails.form_id });
      } else {
        this.handleSearchItems(searchItems);
      }
    });

    events.subscribe('checkoutUpdate', () => {
      this.fetchCheckoutItems();
    });
  }

  public ngOnInit(): void {
    this.dropshipLoader.show();

    const data: FormDetails = this.navParams.get('data');
    const savedOrder: SavedorderList = this.navParams.get('savedOrder');
    this.formDetails = data;
    this.isDropship = this.navParams.get('isDropship');
    this.pageTitle = data.form_name;

    this.selectedQuantity = this.formDetails.selectedQuantity || 1;

    this.fetchFormItems(data, savedOrder);

    this.dropshipService.updateSavedOrder({} as SavedorderList);
    if (savedOrder) {
      if (!this.isDropship) {
        data.form_order_quantity = Number(savedOrder.form_order_quantity);
        this.dropshipService.updateCheckoutItems(data);
        this.selectedItems.push(savedOrder.form_id);
        this.selectedQuantity = data.form_order_quantity;
      }

      this.dropshipService.updateSavedOrder(savedOrder);
    }
  }

  public ngOnDestroy(): void {
    this.events.unsubscribe('searchItems:shop');
    this.events.unsubscribe('checkoutUpdate');
  }

  public ionViewWillEnter(): void {
    this.fetchCheckoutItems();
  }

  public toggleOverlay(): void {
    this.isOverlayActive = !this.isOverlayActive;
  }

  public handleCheckbox(): void {
    this.formDetails.selectedQuantity = this.selectedQuantity;
    this.dropshipService.updateCheckoutItems(this.formDetails);

    this.fetchCheckoutItems();
  }

  public handleCounterAction(action: string): void {
    if (action === 'add') {
      this.selectedQuantity += 1;
    } else if (this.selectedQuantity > 1) {
      this.selectedQuantity -= 1;
    }

    this.dropshipService.updateItemQuantities(this.formDetails, this.selectedQuantity);
  }

  public handleQuantityChange(value: number): void {
    if (value >= 1) {
      this.selectedQuantity = value;
      this.dropshipService.updateItemQuantities(this.formDetails, this.selectedQuantity);
    } else {
      this.selectedQuantity = this.formDetails.selectedQuantity || 1;
    }
  }

  public handleSearch(keyword: string): void {
    this.isScanActive = false;
    this.currentSearchedKeyword = keyword;
    this.dropshipService.searchFormItem(keyword, this.formDetails.form_id, false, true);
  }

  public handleScan(): void {
    this.isScanActive = true;
    this.dropshipService.scanFormItem(this.formDetails.form_id);
  }

  private fetchFormItems(data: FormDetails, savedOrder?: SavedorderList): void {
    this.dropshipProvider.getFormItems(data.form_id).subscribe(response => {
      const item_list: any = response;
      this.itemList = item_list;

      if (!this.isDropship) {
        this.formDetails.item_list = item_list;
      } else if (savedOrder) {
        this.handleSavedOrders(savedOrder, item_list);
      }

      this.fetchCheckoutItems();

      this.dropshipLoader.hide();
    });
  }

  public cancelSearch(): void {
    this.isActiveSearch = false;
    this.pageTitle = this.formDetails.form_name;
    this.dropshipLoader.show();
    this.fetchFormItems(this.formDetails, this.navParams.get('savedOrder'));
  }

  private handleSavedOrders(savedOrder: SavedorderList, item_list: any): void {
    this.dropshipProvider.getSavedorderDetails(savedOrder.order_id).subscribe((response: any) => {
      const savedOrderItems: SavedorderItems[] = response;

      item_list.forEach(item => {
        savedOrderItems.forEach(order => {
          if ('factory_number' in item && item.factory_number === order.factory_number) {
            if (this.formDetails && this.formDetails.special_minimum_order) {
              item.special_minimum_order = this.formDetails.special_minimum_order;
            }

            item.selectedQuantity = Number(order.order_qty || item.min_qty || 1);

            if (!this.selectedItems.includes(item.factory_number)) {
              this.dropshipService.updateCheckoutItems(item);
            }
          }
        });
      });

      this.fetchCheckoutItems();
    });
  }

  private fetchCheckoutItems(searchItems?: FormItems[]): void {
    this.dropshipService.checkoutItemsObservable.pipe(take(1)).subscribe(checkoutItems => {
      this.checkoutItems = checkoutItems;
      this.selectedItems = [];
      this.itemList = (searchItems || this.itemList).map(list => {
        checkoutItems.forEach(item => {
          const currentQuantity: number =
            item.selectedQuantity || item.form_order_quantity || item.order_qty || item.min_qty || 1;

          this.selectedItems.push(this.formDetails.form_id);

          if ('factory_number' in item) {
            if (list.factory_number === item.factory_number) {
              this.selectedItems.push(list.factory_number);
              list.selectedQuantity = currentQuantity;
            }
          } else {
            if (item.form_id === this.formDetails.form_id) {
              this.selectedQuantity = currentQuantity;
            }
          }
        });

        return list;
      });
    });
  }

  private handleSearchItems(searchItems: FormItems[]): void {
    this.isActiveSearch = true;
    this.fetchCheckoutItems(searchItems);
    this.pageTitle = `Search: ${this.currentSearchedKeyword}`;
  }

  public handleMissingImage(): void {
    this.imageError = true;
  }
}
