import {Component, EventEmitter, Input, Output} from '@angular/core';
import * as Constants from '../../util/constants';

@Component({
  selector: 'shopping-list-product',
  templateUrl: 'shopping-list-product.html'
})
export class ShoppingListProductComponent {
  @Input('shoppingListItem') shoppingListItem;
  @Input('isDisabled') isDisabled;
  @Input('showQuantity') showQuantity=true;
  @Output() checked = new EventEmitter<any>();
  @Output() goToDetails = new EventEmitter<any>();

  constructor() {
  }

  updateCheckedItems() {
    let data = {
      status: this.shoppingListItem.isCheckedInShoppingList ? 'checkedItem' : 'uncheckedItem',
      price: (this.shoppingListItem.item_price * this.shoppingListItem.quantity).toFixed(Constants.DECIMAL_NUMBER)
    };
    this.checked.emit(data);
  }

  goToProductDetails() {
    if (!this.isDisabled) {
      return;
    }
    this.goToDetails.emit(this.shoppingListItem);
  }
}
