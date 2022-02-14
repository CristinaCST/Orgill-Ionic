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

      navController.push(CheckoutPage, { searchItems, form_id: this.formDetails.form_id });
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

    if (savedOrder) {
      if (!this.isDropship) {
        data.form_order_quantity = Number(savedOrder.form_order_quantity);
        this.dropshipService.updateCheckoutItems(data);
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
    this.dropshipService.searchFormItem(keyword, this.formDetails.form_id);
  }

  public handleScan(): void {
    this.dropshipService.scanFormItem(this.formDetails.form_id);
  }

  private fetchFormItems(data: FormDetails, savedOrder?: SavedorderList): void {
    if (savedOrder && this.isDropship) {
      this.dropshipProvider.getSavedorderDetails({ order_id: savedOrder.order_id }).subscribe(response => {
        const savedOrderItems: SavedorderItems[] = JSON.parse(response.d);

        this.dropshipService.resetCart(savedOrderItems);
        this.fetchCheckoutItems();
      });
    }

    this.dropshipProvider.getFormItems({ form_id: data.form_id }).subscribe(response => {
      const item_list: any = JSON.parse(response.d);
      this.itemList = item_list;

      if (!this.isDropship) {
        this.formDetails.item_list = item_list;
      }

      this.fetchCheckoutItems();

      this.dropshipLoader.hide();
    });
  }

  private fetchCheckoutItems(): void {
    this.dropshipService.checkoutItemsObservable.pipe(take(1)).subscribe(checkoutItems => {
      this.checkoutItems = checkoutItems;
      this.selectedItems = [];
      this.itemList = this.itemList.map(list => {
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

  public handleMissingImage(): void {
    this.imageError = true;
  }
}
