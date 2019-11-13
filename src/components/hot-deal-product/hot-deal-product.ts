import { Component, Input, AfterViewInit } from '@angular/core';
import { ProductImageProvider } from '../../providers/product-image/product-image';
import { ItemProgram } from '../../interfaces/models/item-program';
import { Product } from '../../interfaces/models/product';

@Component({
  selector: 'hot-deal-product',
  templateUrl: 'hot-deal-product.html'
})
export class HotDealProductComponent implements AfterViewInit {

  constructor(private readonly imageProvider: ProductImageProvider) { }

  @Input('hotDealItem') public hotDealItem: Product;
  @Input('orderTotal') public orderTotal: number;
  @Input() public priceHotDealItem: ItemProgram;

  public imageURL: string = '';
  public imageIsLoading: boolean = true;

  public ngAfterViewInit(): void {
    this.imageProvider.getImageURL(this.hotDealItem.SKU).then(data => {
      this.imageURL = data;
      this.imageIsLoading = false;
    });
  }
}
