import { Component, Input, AfterViewInit } from '@angular/core';
import { HotDealItem } from '../../interfaces/models/hot-deal-item';
import { ProductImageProvider } from '../../providers/product-image/product-image';

@Component({
  selector: 'hot-deal-product',
  templateUrl: 'hot-deal-product.html'
})
export class HotDealProductComponent implements AfterViewInit {

  constructor(private readonly imageProvider: ProductImageProvider) { }

  @Input('hotDealItem') public hotDealItem: HotDealItem;
  @Input('orderTotal') public orderTotal: number;

  public imageURL: string = '';
  public imageIsLoading: boolean = true;

  public ngAfterViewInit(): void {
    this.imageProvider.getImageURL(this.hotDealItem.ITEM.SKU).then(data => {
      this.imageURL = data;
      this.imageIsLoading = false;
    });
  }
}
