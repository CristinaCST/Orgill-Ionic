import {Component, EventEmitter, Input, Output} from '@angular/core';


@Component({
  selector: 'shopping-list-product',
  templateUrl: 'shopping-list-product.html'
})
export class ShoppingListProductComponent {
  @Input('shoppingListItem') shoppingListItem;
  @Input('isDisabled') isDisabled;
  @Output() checked = new EventEmitter<any>();

  constructor() {
  }

  updateCheckedItems() {
    let data = {
      status: this.shoppingListItem.isCheckedInShoppingList ? 'checkedItem' : 'uncheckedItem',
      price: this.shoppingListItem.item_price
    };
    this.checked.emit(data);
  }
}
