import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';


@Component({
  selector: 'shopping-list-product',
  templateUrl: 'shopping-list-product.html'
})
export class ShoppingListProductComponent implements OnInit {
  @Input('shoppingListItem') shoppingListItem;
  @Input('isDisabled') isDisabled;
  @Output() checked = new EventEmitter<any>();

  constructor() {
  }

  ngOnInit(): void {
    console.log(this.shoppingListItem)
  }

  updateCheckedItems() {
    let data = {
      status: this.shoppingListItem.isCheckedInShoppingList ? 'checkedItem' : 'uncheckedItem',
      price: this.shoppingListItem.item_price
    };
    this.checked.emit(data);
  }
}
