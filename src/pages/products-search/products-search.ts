import {Component, OnDestroy, OnInit} from '@angular/core';
import {NavController, NavParams} from 'ionic-angular';
import {Product} from "../../interfaces/models/product";
import {ProductPage} from "../product/product";
import {CatalogsProvider} from "../../providers/catalogs/catalogs";
import {LoadingProvider} from "../../providers/loading/loading";
import {Category} from "../../interfaces/models/category";
import {Subscription} from "rxjs/Subscription";
import * as Constants from '../../util/constants';

@Component({
  selector: 'page-products-search',
  templateUrl: 'products-search.html',
})
export class ProductsSearchPage implements OnInit, OnDestroy {
  private getProductSubscription: Subscription;
  searchString: string;
  programName: string;
  programNumber: string;
  category: Category;
  products: Array<Product> = [];
  isPaginationEnabled: boolean = false;
  page: number = 1;
  totalNumberOfProducts: number = 0;

  constructor(public navParams: NavParams, private navController: NavController,
              public loading: LoadingProvider, private catalogProvider: CatalogsProvider,) {
  }

  ngOnInit(): void {
    this.searchString = this.navParams.get('searchString');
    this.category = this.navParams.get('category');
    this.programNumber = this.navParams.get('programNumber');
    this.programName = this.navParams.get('programName');
    this.getProduct(this.navParams.get('searchData'));
    this.setPaginationInfo();
  }

  sortProducts(responseData) {
    return responseData.sort((product1, product2): number => {
      return product1.NAME.localeCompare(product2.NAME);
    });
  }

  getProduct(data) {
    this.products = this.sortProducts(data);
  }

  onSearched($event) {
    this.loading.presentSimpleLoading();
    this.catalogProvider.search($event, this.category ? this.category.CatID : '', this.programNumber).subscribe(data => {
      const params = {
        searchData: JSON.parse(data.d),
        programNumber: this.programNumber,
        programName: this.programName,
        category: this.category
      };
      this.navController.push(ProductsSearchPage, params).then(() => console.log('%cTo product search page', 'color:blue'));
      this.loading.hideLoading();
    });
  }

  goToProductPage(product: Product) {
    this.navController.push(ProductPage, {
      'product': product,
      'programName': this.programName,
      'programNumber': this.programNumber,
      'subcategoryName': this.category ? this.category.CatName : ''
    }).then(() => console.log('%cTo product details page', 'color:pink'));
  }

  next() {
    this.page += 1;
    this.loadNextProducts();
  }

  setPaginationInfo() {
    if (this.products.length) {
      this.totalNumberOfProducts = parseInt(this.products[0].TOTAL_REC_COUNT);
    }
    this.isPaginationEnabled = this.page * Constants.SEARCH_RESULTS_PER_PAGE < this.totalNumberOfProducts;
  }

  loadNextProducts() {
    this.loading.presentSimpleLoading();
    this.getProductSubscription = this.catalogProvider.search(this.searchString, this.category ? this.category.CatID : '', this.programNumber, this.page)
      .subscribe((response) => {
        this.products = this.products.concat(this.sortProducts(JSON.parse(response.d)));
        this.setPaginationInfo();
        this.loading.hideLoading();
      })
  }

  ngOnDestroy(): void {
    if (this.page > 1) {
      this.getProductSubscription.unsubscribe();
    }
  }

}
