import { Component, Input, OnInit } from '@angular/core';
import { Events, NavController } from 'ionic-angular';
import { ShopItemsPage } from '../../pages/ds-shop-items/shop-items';
import { ItemDetailsPage } from '../../pages/ds-item-details/item-details';
import { FormDetails } from '../../interfaces/response-body/dropship';
import { DropshipService } from '../../services/dropship/dropship';

@Component({
  selector: 'checkbox-card',
  templateUrl: 'checkbox-card.html'
})
export class CheckboxCardComponent implements OnInit {
  @Input() public data: any;
  @Input() public formDetails: FormDetails | undefined;
  @Input() public isSelected: boolean;
  @Input() public isDropship: boolean;
  @Input() public isCheckout: boolean;
  @Input() public selectedQuantity: number = 1;

  constructor(
    public navController: NavController,
    public events: Events,
    private readonly dropshipService: DropshipService
  ) {}

  public ngOnInit(): void {
    this.selectedQuantity = Number(this.data.selectedQuantity || this.data.order_qty || this.data.min_qty || 1);
  }

  public handleClick(): void {
    if (this.isCheckout) {
      return;
    }

    if (this.formDetails) {
      this.navController.push(ItemDetailsPage, { data: this.data, formDetails: this.formDetails });
    } else {
      this.navController.push(ShopItemsPage, { data: this.data });
    }
  }

  public handleCheckbox(): void {
    const currentItem: any = this.data;

    if (this.formDetails && this.formDetails.special_minimum_order) {
      currentItem.special_minimum_order = this.formDetails.special_minimum_order;
    }

    currentItem.selectedQuantity = Number(
      currentItem.selectedQuantity || this.data.order_qty || this.data.min_qty || 1
    );

    this.dropshipService.updateCheckoutItems(currentItem);

    this.events.publish('checkoutUpdate', this.isSelected);
  }

  public handleCounterAction(action: string): void {
    let currentQuantity: number = this.selectedQuantity;

    if (action === 'add') {
      currentQuantity += 1;
    } else if (currentQuantity > (this.data.min_qty || 1)) {
      currentQuantity -= 1;
    }

    if (currentQuantity !== this.selectedQuantity) {
      this.dropshipService.updateItemQuantities(this.data, currentQuantity);
      this.events.publish('checkoutUpdate', this.isSelected);
    }
  }

  public handleQuantityChange(value: number): void {
    if (value >= (this.data.min_qty || 1)) {
      this.selectedQuantity = value;
      this.dropshipService.updateItemQuantities(this.data, this.selectedQuantity);
    } else {
      this.selectedQuantity = Number(this.data.selectedQuantity || this.data.order_qty || this.data.min_qty || 1);
    }
  }
}
