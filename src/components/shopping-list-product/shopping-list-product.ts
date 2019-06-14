import { Component, EventEmitter, Input, Output } from '@angular/core';
import * as Constants from '../../util/constants';
import { ShoppingListItem } from '../../interfaces/models/shopping-list-item';
import { PricingService } from '../../services/pricing/pricing';

@Component({
  selector: 'shopping-list-product',
  templateUrl: 'shopping-list-product.html'
})
export class ShoppingListProductComponent {
  @Input('shoppingListItem') public shoppingListItem: ShoppingListItem;
  @Input('isDisabled') public isDisabled: boolean;
  @Output() public checked: EventEmitter<any> = new EventEmitter<any>();
  @Output() public goToDetails: EventEmitter<any> = new EventEmitter<any>();

  constructor(private readonly pricingService: PricingService) {}
  
  public updateCheckedItems() {
    const data = {
      status: this.shoppingListItem.isCheckedInShoppingList ? 'checkedItem' : 'uncheckedItem',
      price: this.getRealPrice().toFixed(Constants.DECIMAL_NUMBER)
    };
    this.checked.emit(data);
  }

  public goToProductDetails() {
    if (!this.isDisabled) {
      return;
    }
    this.goToDetails.emit(this.shoppingListItem);
  }

  public getRealPrice() {
    return this.pricingService.getShoppingListPrice(this.shoppingListItem.quantity, this.shoppingListItem.product, this.shoppingListItem.item_price);
  }
}
