import {Component, OnInit} from '@angular/core';
import {NavParams} from 'ionic-angular';
import {Product} from "../../interfaces/models/product";
import {CatalogsProvider} from "../../providers/catalogs/catalogs";
import {LoadingProvider} from "../../providers/loading/loading";

@Component({
  selector: 'page-product-description',
  templateUrl: 'product-description.html',
})
export class ProductDescriptionPage implements OnInit {
  description: string = "";
  product: Product;

  constructor(private navParams: NavParams, private catalogProvider: CatalogsProvider,
              public loading: LoadingProvider) {
  }

  ngOnInit(): void {
    this.product = this.navParams.get('product');
    this.loading.presentSimpleLoading();
    this.catalogProvider.getProductDetails(this.product.SKU).subscribe((description) => {
      this.description = JSON.parse(description.d).description;
      this.loading.hideLoading();
    });
  }

}
