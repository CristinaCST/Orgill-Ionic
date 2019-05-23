import {Component, OnDestroy, OnInit} from '@angular/core';
import { NavParams, NavOptions} from 'ionic-angular';
import {Product} from "../../interfaces/models/product";
import {CatalogsProvider} from "../../providers/catalogs/catalogs";
import {ProductPage} from "../product/product";
import {Category} from "../../interfaces/models/category";
import {Subscription} from "rxjs/Subscription";
import {ProductsSearchPage} from "../products-search/products-search";
import {LoadingService} from "../../services/loading/loading";
import * as Constants from "../../util/constants";
import { NavigatorService } from '../../services/navigator/navigator';
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
  private loader: LoadingService;

  constructor(private navParams: NavParams,
              public loadingService: LoadingService,
              private catalogProvider: CatalogsProvider, private navigatorService: NavigatorService) {
                this.loader = loadingService.createLoader();
  }

  ngOnInit() {
    this.programNumber = this.navParams.get('programNumber');
    this.programName = this.navParams.get('programName');
    this.category = this.navParams.get('category');

    this.getProducts();
    this.setPaginationInfo();
  }

  getProducts() {
    this.loader.show();
    this.getProductSubscription = this.catalogProvider.getProducts(this.category ? this.category.CatID : '', this.programNumber, this.page).subscribe(response => {
      this.products = this.sortProducts(JSON.parse(response.d));
      console.log("PRODUCTS NUMBER:"+this.products,this.products);
      this.loader.hide();
      this.isLoading = false;
      this.setPaginationInfo();
    })
  }

  sortProducts(responseData) {
    return responseData.sort((product1, product2): number =>
      product1.NAME.localeCompare(product2.NAME)
    );
  }

  goToProductPage(product: Product) {
    this.navigatorService.push(ProductPage, {
      'product': product,
      'programName': this.programName,
      'programNumber': this.programNumber
    }).then(() => {
      //console.log('%cTo product details page', 'color:pink');
    });
  }

  ngOnDestroy(): void {
    if (this.page > 1) {
      this.getProductSubscription.unsubscribe();
    }
  }

  onSearched($event) {
    this.loader.show();
    this.catalogProvider.search($event, this.category ? this.category.CatID : '', this.programNumber).subscribe(data => {
      let dataFound = JSON.parse(data.d);
      const params = {
        searchData: dataFound,
        programNumber: this.programNumber,
        programName: this.programName,
        category: this.category,
        numberOfProductsFound: dataFound[0] ? dataFound[0].TOTAL_REC_COUNT : 0
      };
      this.loader.hide();
      this.navigatorService.push(ProductsSearchPage, params, {paramsEquality:false} as NavOptions).then(
       // () => console.log('%cTo product search page', 'color:blue')
        );
    });
  }

  next() {
    this.page += 1;
    this.loadNextProducts();
  }

  loadNextProducts() {
    this.loader.show();
    this.getProductSubscription = this.catalogProvider.getProducts(this.category ? this.category.CatID : '', this.programNumber, this.page)
      .subscribe((response) => {
        this.products = this.products.concat(this.sortProducts(JSON.parse(response.d)));
        this.setPaginationInfo();
        this.loader.hide();
      })
  }

  setPaginationInfo() {
    if (this.products.length) {
      this.totalNumberOfProducts = parseInt(this.products[0].TOTAL_REC_COUNT);
    }
    this.isPaginationEnabled = this.page * Constants.PRODUCTS_PER_PAGE < this.totalNumberOfProducts;
  }
}
