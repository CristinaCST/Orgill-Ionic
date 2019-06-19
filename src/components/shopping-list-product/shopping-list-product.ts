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
  private realPrice: string;

  constructor(private readonly pricingService: PricingService) {}
  
  public ngOnInit(): void {
    this.realPrice = this.realPrice ? this.realPrice : this.getRealPrice().toFixed(Constants.DECIMAL_NUMBER);
  }

  public updateCheckedItems(): void {
    const data: { status: string, price: string } = {
      status: this.shoppingListItem.isCheckedInShoppingList ? 'checkedItem' : 'uncheckedItem',
      price: this.realPrice
    };
    this.checked.emit(data);
  }

  public goToProductDetails(): void {
    if (!this.isDisabled) {
      return;
    }
    this.goToDetails.emit(this.shoppingListItem);
  }

  public getRealPrice(): number {
    return this.pricingService.getShoppingListPrice(this.shoppingListItem.quantity, this.shoppingListItem.product, this.shoppingListItem.item_price);
  }
}
