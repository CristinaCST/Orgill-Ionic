import {AfterViewInit, Component, Input, OnInit} from '@angular/core';
import {Product} from "../../interfaces/models/product";
import {ProductDescriptionPage} from "../../pages/product-description/product-description";
import { NavController } from 'ionic-angular';
import * as Constants from '../../util/constants';
import * as ConstantsUrl from '../../util/constants-url';

@Component({
  selector: 'product-details',
  templateUrl: 'product-details.html'
})
export class ProductDetailsComponent implements OnInit, AfterViewInit {

  @Input() product: Product;
  public imageIsLoading: boolean = true;

  constructor(private navController: NavController) {
  }

  public showProductDescription() {
    this.navController.push(ProductDescriptionPage, {'product': this.product}).catch(err => console.error(err))
  }

  //TODO: CHANEG FROM CONSTANTS
  ngOnInit(): void {
   
    
    this.product.IMAGE = this.product.IMAGE === '0000000.jpg' ? Constants.LOCAL_PRODUCT_IMAGE_PLACEHOLDER :
      ConstantsUrl.PRODUCT_IMAGE_BASE_URL + this.product.SKU + '.JPG';
  }

  loadImage() {
    return new Promise((resolve, reject) => {
      let img = new Image();
      img.addEventListener('load', () => resolve(img));
      img.onerror = () => {
        reject(new Error('Failed to load URL'));
      };
      img.src = this.product.IMAGE;
    });
  }

  ngAfterViewInit(): void {
    this.loadImage().then(() => {
      this.imageIsLoading = false;
    }).catch(error => {
      console.error(error);
      this.imageIsLoading = false;
      this.product.IMAGE = '../../assets/imgs/product_placeholder.png';
    });
  }
}
