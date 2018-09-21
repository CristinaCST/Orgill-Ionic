import {Component, OnInit} from '@angular/core';
import {NavParams} from 'ionic-angular';
import {Product} from "../../interfaces/models/product";
import {ProductsRequest} from "../../interfaces/request-body/products-request";
import * as Constants from '../../util/constants';
import {CatalogsProvider} from "../../providers/catalogs/catalogs";
import {LocalStorageHelper} from "../../helpers/local-storage-helper";


@Component({
  selector: 'page-products',
  templateUrl: 'products.html',
})
export class ProductsPage implements OnInit {

  userToken: string;
  subCategoryId: string;
  programNumber: string;
  pageNumber: number;
  products: Array<Product> = [];

  constructor(public navParams: NavParams, public catalogProvider: CatalogsProvider) {
    this.pageNumber = 1;
    this.userToken = JSON.parse(LocalStorageHelper.getFromLocalStorage(Constants.USER)).userToken;
  }

  ngOnInit() {
    this.subCategoryId = this.navParams.get('subCategoryId');
    this.programNumber = this.navParams.get('programNumber');
    this.getProducts(this.subCategoryId, this.programNumber);
  }

  getProducts(subcategoryId: string, programNumber: string) {
    if (!programNumber)
      programNumber = '';

    const params: ProductsRequest = {
      'user_token': this.userToken,
      'subcategory_id': subcategoryId,
      'p': String(this.pageNumber),
      'rpp': String(Constants.PRODUCTS_PER_PAGE),
      'program_number': programNumber,
      'last_modified': '',
    };

    this.catalogProvider.getProducts(params).subscribe(response => {
      const responseData = JSON.parse(response.d);
      this.products = this.sortProducts(responseData);
    })
  }

  sortProducts(responseData) {
    return responseData.sort((product1, product2): number => {
      return product1.NAME.localeCompare(product2.NAME);
    });
  }

}
