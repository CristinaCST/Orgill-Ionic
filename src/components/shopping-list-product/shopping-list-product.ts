import {Component, EventEmitter, Input, Output} from '@angular/core';
import * as Constants from '../../util/constants';
import { PricingService } from '../../services/pricing/pricing';

@Component({
  selector: 'shopping-list-product',
  templateUrl: 'shopping-list-product.html'
})
export class ShoppingListProductComponent {
  @Input('shoppingListItem') shoppingListItem;
  @Input('isDisabled') isDisabled;
  @Output() checked = new EventEmitter<any>();
  @Output() goToDetails = new EventEmitter<any>();

  constructor(private pricingService: PricingService) {
  }

  updateCheckedItems() {
    let data = {
      status: this.shoppingListItem.isCheckedInShoppingList ? 'checkedItem' : 'uncheckedItem',
      price: this.getRealPrice().toFixed(Constants.DECIMAL_NUMBER)
    };
    this.checked.emit(data);
  }

  goToProductDetails() {
    if (!this.isDisabled) {
      return;
    }
    this.goToDetails.emit(this.shoppingListItem);
  }

  /**
   * Safe not to validate since there are no inputs here.
   */
  getRealPrice(){
    return Number(this.shoppingListItem.item_price*this.shoppingListItem.quantity);
  }
}
