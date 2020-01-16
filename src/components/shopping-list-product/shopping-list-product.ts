import { Component, EventEmitter, Input, Output, AfterViewInit } from '@angular/core';
import * as Constants from '../../util/constants';
import { ShoppingListItem } from '../../interfaces/models/shopping-list-item';
import { PricingService } from '../../services/pricing/pricing';
import { ProductImageProvider } from '../../providers/product-image/product-image';

@Component({
  selector: 'shopping-list-product',
  templateUrl: 'shopping-list-product.html'
})
export class ShoppingListProductComponent implements AfterViewInit {
  @Input('shoppingListItem') public shoppingListItem: ShoppingListItem;
  @Input('isDisabled') public isDisabled: boolean;
  @Output() public checked: EventEmitter<any> = new EventEmitter<any>();
  @Output() public goToDetails: EventEmitter<any> = new EventEmitter<any>();
  private realPrice: string;
  public imageURL: string = '';
  public imageIsLoading: boolean = true;

  constructor(private readonly pricingService: PricingService,
              private readonly imageProvider: ProductImageProvider) {}

  public ngOnInit(): void {
    this.realPrice = this.realPrice ? this.realPrice : this.getRealPrice().toFixed(Constants.DECIMAL_NUMBER);
  }

  public updateCheckedItems(): void {
    const data: { status: string, price: string, product: ShoppingListItem } = {
      status: this.shoppingListItem.isCheckedInShoppingList ? 'checkedItem' : 'uncheckedItem',
      price: this.realPrice,
      product: this.shoppingListItem
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

  public ngAfterViewInit(): void {
    this.imageProvider.getImageURL(this.shoppingListItem.product.SKU).then(data => {
      this.imageURL = data;
      this.imageIsLoading = false;
    });
  }
}
