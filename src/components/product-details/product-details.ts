import { AfterViewInit, Component, Input } from '@angular/core';
import { Product } from '../../interfaces/models/product';
import { ProductDescriptionPage } from '../../pages/product-description/product-description';
import { NavigatorService } from '../../services/navigator/navigator';
import { ProductImageProvider } from '../../providers/product-image/product-image';

@Component({
  selector: 'product-details',
  templateUrl: 'product-details.html'
})
export class ProductDetailsComponent implements AfterViewInit {

  @Input() public product: Product;
  public imageIsLoading: boolean = true;
  public imageURL: string = '';

  constructor(private readonly navigatorService: NavigatorService,
              private readonly imageProvider: ProductImageProvider) {}

  public showProductDescription(): void {
    this.navigatorService.push(ProductDescriptionPage, { 'product': this.product }).catch(err => console.error(err));
  }

  public ngAfterViewInit(): void {
    this.imageProvider.getImageURL(this.product.SKU).then(data => {
      this.imageURL = data;
      this.imageIsLoading = false;
    });
  }
}
