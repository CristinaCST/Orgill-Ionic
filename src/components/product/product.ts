import { AfterViewInit, Component, Input } from '@angular/core';
import { Product } from '../../interfaces/models/product';
import { ProductImageProvider } from '../../providers/product-image/product-image';

@Component({
  selector: 'product',
  templateUrl: 'product.html'
})
export class ProductComponent implements AfterViewInit {
  constructor(private readonly imageProvider: ProductImageProvider) {}

  @Input('product') public product: Product;
  public imageURL: string = '';
  public imageIsLoading: boolean = true;

  public ngAfterViewInit(): void {
    this.imageProvider.getImageURL(this.product.sku).then(data => {
      this.imageURL = data;
      this.imageIsLoading = false;
    });
  }
}
