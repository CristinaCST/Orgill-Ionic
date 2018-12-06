import {Component, OnDestroy, OnInit} from '@angular/core';
import {NavController, NavParams} from 'ionic-angular';
import {Product} from "../../interfaces/models/product";
import {CatalogsProvider} from "../../providers/catalogs/catalogs";
import {ProductPage} from "../product/product";
import {Category} from "../../interfaces/models/category";
import {Subscription} from "rxjs/Subscription";
import {ProductsSearchPage} from "../products-search/products-search";
import {LoadingProvider} from "../../providers/loading/loading";
import * as Constants from "../../util/constants";

@Component({
  selector: 'page-products',
  templateUrl: 'products.html',
})
export class ProductsPage implements OnInit, OnDestroy {
  private getProductSubscription: Subscription;
  private programName: string;
  private programNumber: string;
  public isPaginationEnabled: boolean = false;
  public totalNumberOfProducts: number = 0;
  public category: Category;
  public page: number = 1;
  public products: Array<Product> = [];
  public isLoading:boolean = true;

  constructor(private navParams: NavParams,
              public loading: LoadingProvider,
              private catalogProvider: CatalogsProvider, private navController: NavController) {
  }

  ngOnInit() {
    this.programNumber = this.navParams.get('programNumber');
    this.programName = this.navParams.get('programName');
    this.category = this.navParams.get('category');

    this.getProducts();
    this.setPaginationInfo();
  }

  getProducts() {
    this.loading.presentSimpleLoading();
    this.getProductSubscription = this.catalogProvider.getProducts(this.category ? this.category.CatID : '', this.programNumber, this.page).subscribe(response => {
      this.products = this.sortProducts(JSON.parse(response.d));
      this.loading.hideLoading();
      this.isLoading = false;
    })
  }

  sortProducts(responseData) {
    return responseData.sort((product1, product2): number =>
      product1.NAME.localeCompare(product2.NAME)
    );
  }

  goToProductPage(product: Product) {
    this.navController.push(ProductPage, {
      'product': product,
      'programName': this.programName,
      'programNumber': this.programNumber
    }).then(() => {
      console.log('%cTo product details page', 'color:pink');
    });
  }

  ngOnDestroy(): void {
    if (this.page > 1) {
      this.getProductSubscription.unsubscribe();
    }
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
      this.loading.hideLoading();
      this.navController.push(ProductsSearchPage, params).then(() => console.log('%cTo product search page', 'color:blue'));
    });
  }

  next() {
    this.page += 1;
    this.loadNextProducts();
  }

  loadNextProducts() {
    this.loading.presentSimpleLoading();
    this.getProductSubscription = this.catalogProvider.getProducts(this.category ? this.category.CatID : '', this.programNumber, this.page)
      .subscribe((response) => {
        this.products = this.products.concat(this.sortProducts(JSON.parse(response.d)));
        this.setPaginationInfo();
        this.loading.hideLoading();
      })
  }

  setPaginationInfo() {
    if (this.products.length) {
      this.totalNumberOfProducts = parseInt(this.products[0].TOTAL_REC_COUNT);
    }
    this.isPaginationEnabled = this.page * Constants.SEARCH_RESULTS_PER_PAGE < this.totalNumberOfProducts;
  }
}
