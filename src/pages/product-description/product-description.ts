import {AfterViewInit, Component, OnInit} from '@angular/core';
import {NavParams} from 'ionic-angular';
import {Product} from "../../interfaces/models/product";
import {CatalogsProvider} from "../../providers/catalogs/catalogs";
import {LoadingService} from "../../services/loading/loading";

@Component({
  selector: 'page-product-description',
  templateUrl: 'product-description.html',
})
export class ProductDescriptionPage implements OnInit, AfterViewInit {
  description: string = "";
  product: Product;
  public imageIsLoading: boolean = true;
  loader:LoadingService;

  constructor(private navParams: NavParams, private catalogProvider: CatalogsProvider,
              public loadingService: LoadingService) {
                this.loader = this.loadingService.createLoader();
  }

  ngOnInit(): void {
    this.product = this.navParams.get('product');
    this.loader.show();
    this.catalogProvider.getProductDetails(this.product.SKU).subscribe((description) => {
      this.description = JSON.parse(description.d).description;
      this.loader.hide();
    });
    this.product.IMAGE = this.product.IMAGE === '0000000.jpg' ? '../../assets/imgs/product_placeholder.png' :
      'http://images.orgill.com/200x200/' + this.product.SKU + '.JPG';
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
