import { AfterViewInit, Component, Input, OnInit } from '@angular/core';
import * as Constants from '../../util/constants';
import * as ConstantsUrl from '../../util/constants-url';
import { Product } from '../../interfaces/models/product';

@Component({
  selector: 'product',
  templateUrl: 'product.html'
})
export class ProductComponent implements OnInit, AfterViewInit {

  @Input('product') public product: Product;
  public imageIsLoading: boolean = true;

  public ngOnInit(): void {
    this.product.IMAGE = this.product.IMAGE === '0000000.jpg' ? Constants.LOCAL_PRODUCT_IMAGE_PLACEHOLDER :
    ConstantsUrl.PRODUCT_IMAGE_BASE_URL + this.product.SKU + '.JPG';
  }

  public loadImage(): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img: HTMLImageElement = new Image();
      img.addEventListener('load', e => resolve(img));
      img.onerror = () => {
        reject(new Error('Failed to load URL'));
      };
      img.src = this.product.IMAGE;
    });
  }

  public ngAfterViewInit(): void {
    this.loadImage().then(data => {
      this.imageIsLoading = false;
    }).catch(error => {
      console.error(error);
      this.imageIsLoading = false;
      this.product.IMAGE = '../../assets/imgs/product_placeholder.png';
    });
  }

}
