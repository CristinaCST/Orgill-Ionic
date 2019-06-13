import { AfterViewInit, Component, Input, OnInit } from '@angular/core';
import { Product } from '../../interfaces/models/product';
import { ProductDescriptionPage } from '../../pages/product-description/product-description';
import * as Constants from '../../util/constants';
import * as ConstantsUrl from '../../util/constants-url';
import { NavigatorService } from '../../services/navigator/navigator';

@Component({
  selector: 'product-details',
  templateUrl: 'product-details.html'
})
export class ProductDetailsComponent implements OnInit, AfterViewInit {

  @Input() public product: Product;
  public imageIsLoading: boolean = true;

  constructor(private navigatorService: NavigatorService) {
  }

  public showProductDescription() {
    this.navigatorService.push(ProductDescriptionPage, { 'product': this.product }).catch(err => console.error(err));
  }

  // TODO: CHANEG FROM CONSTANTS
  public ngOnInit(): void {


    this.product.IMAGE = this.product.IMAGE === '0000000.jpg' ? Constants.LOCAL_PRODUCT_IMAGE_PLACEHOLDER :
      ConstantsUrl.PRODUCT_IMAGE_BASE_URL + this.product.SKU + '.JPG';
  }

  public loadImage() {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.addEventListener('load', () => resolve(img));
      img.onerror = () => {
        reject(new Error('Failed to load URL'));
      };
      img.src = this.product.IMAGE;
    });
  }

  public ngAfterViewInit(): void {
    this.loadImage().then(() => {
      this.imageIsLoading = false;
    }).catch(error => {
      console.error(error);
      this.imageIsLoading = false;
      this.product.IMAGE = '../../assets/imgs/product_placeholder.png';
    });
  }
}
