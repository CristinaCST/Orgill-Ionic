import { Component, OnInit } from '@angular/core';
import { NavParams } from 'ionic-angular';
import { take } from 'rxjs/operators';
import { DropshipProvider } from '../../providers/dropship/dropship';
import { FormDetails, SavedorderItems, SavedorderList } from '../../interfaces/response-body/dropship';
import { LoadingService } from '../../services/loading/loading';
import { DropshipService } from '../../services/dropship/dropship';
import { TranslateWrapperService } from '../../services/translate/translate';
import { loading_text } from '../../util/strings';

@Component({
  selector: 'page-shop-items',
  templateUrl: 'shop-items.html'
})
export class ShopItemsPage implements OnInit {
  public itemList: any;
  public formDetails: FormDetails;
  public isDropship: boolean = false;
  public isOverlayActive: boolean = false;
  public pageTitle: string;
  public checkoutItems: FormDetails;
  public selectedItems: any = [];
  public selectedQuantity: number = 1;
  private readonly dropshipLoader: LoadingService;

  constructor(
    public dropshipProvider: DropshipProvider,
    public loadingService: LoadingService,
    private readonly navParams: NavParams,
    private readonly dropshipService: DropshipService,
    private readonly translateProvider: TranslateWrapperService
  ) {
    this.dropshipLoader = loadingService.createLoader(this.translateProvider.translate(loading_text));
  }

  public ngOnInit(): void {
    this.dropshipLoader.show();

    const data: FormDetails = this.navParams.get('data');
    const savedOrder: SavedorderList = this.navParams.get('savedOrder');
    this.formDetails = data;
    this.isDropship = this.navParams.get('isDropship');
    this.pageTitle = data.form_name;

    // tslint:disable-next-line: strict-boolean-expressions
    this.selectedQuantity = this.formDetails.selectedQuantity || 1;

    this.fetchFormItems(data, savedOrder);

    if (savedOrder && !this.isDropship) {
      data.form_order_quantity = Number(savedOrder.form_order_quantity);
      this.dropshipService.updateCheckoutItems(data);
    }
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
      // tslint:disable-next-line: strict-boolean-expressions
      this.selectedQuantity = this.formDetails.selectedQuantity || 1;
    }
  }

  private fetchFormItems(data: FormDetails, savedOrder?: SavedorderList): void {
    if (savedOrder && this.isDropship) {
      this.dropshipProvider.getSavedorderDetails({ order_id: savedOrder.order_id }).subscribe(response => {
        const savedOrderItems: SavedorderItems[] = JSON.parse(response.d);
        this.itemList = savedOrderItems;

        this.dropshipService.resetCart(savedOrderItems);
        this.fetchCheckoutItems();

        this.dropshipLoader.hide();
      });

      return;
    }

    this.dropshipProvider.getFormItems({ form_id: data.form_id }).subscribe(response => {
      this.itemList = JSON.parse(response.d);

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
            item.selectedQuantity || item.form_order_quantity || item.order_qty || item.order_qty || 1;

          if ('factory_number' in item) {
            if (list.factory_number === item.factory_number) {
              this.selectedItems.push(list.factory_number);
              list.selectedQuantity = currentQuantity;
            }
          } else {
            if (item.form_id === this.formDetails.form_id) {
              this.selectedItems.push(this.formDetails.form_id);
              this.selectedQuantity = currentQuantity;
            }
          }
        });

        return list;
      });
    });
  }
}
