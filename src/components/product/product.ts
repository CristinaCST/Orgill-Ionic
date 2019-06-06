import {AfterViewInit, Component, Input, OnInit} from '@angular/core';
import * as Constants from '../../util/constants';
import * as ConstantsUrl from '../../util/constants-url';

@Component({
  selector: 'product',
  templateUrl: 'product.html'
})
export class ProductComponent implements OnInit, AfterViewInit {

  @Input('product') product;
  public imageIsLoading: boolean = true;

  constructor() {
  }

  ngOnInit(): void {
    this.product.IMAGE = this.product.IMAGE === '0000000.jpg' ? Constants.LOCAL_PRODUCT_IMAGE_PLACEHOLDER :
    ConstantsUrl.PRODUCT_IMAGE_BASE_URL + this.product.SKU + '.JPG';
  }

  loadImage() {
    return new Promise((resolve, reject) => {
      let img = new Image();
      img.addEventListener('load', e => resolve(img));
      img.onerror = () => {
        reject(new Error('Failed to load URL'));
      };
      img.src = this.product.IMAGE;
    });
  }

  ngAfterViewInit(): void {
    this.loadImage().then((data) => {
      this.imageIsLoading = false;
    }).catch(error => {
      console.error(error);
      this.imageIsLoading = false;
      this.product.IMAGE = '../../assets/imgs/product_placeholder.png';
    });
  }

}
