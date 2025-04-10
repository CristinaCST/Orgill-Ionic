import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavParams, NavOptions } from 'ionic-angular';
import { Product } from '../../interfaces/models/product';
import { ProductPage } from '../product/product';
import { CatalogsProvider } from '../../providers/catalogs/catalogs';
import { LoadingService } from '../../services/loading/loading';
import { Category } from '../../interfaces/models/category';
import { Subscription } from 'rxjs/Subscription';
import * as Constants from '../../util/constants';
import { NavigatorService } from '../../services/navigator/navigator';
import { getNavParam } from '../../helpers/validatedNavParams';

@Component({
  selector: 'page-products-search',
  templateUrl: 'products-search.html'
})
export class ProductsSearchPage implements OnInit, OnDestroy {
  private getProductSubscription: Subscription;
  public searchString: string;
  public programName: string;
  public programNumber: string;
  public category: Category;
  public products: Product[] = [];
  public isPaginationEnabled: boolean = false;
  public page: number = 1;
  public totalNumberOfProducts: number = 0;
  private readonly loader: LoadingService;

  constructor(
    public navParams: NavParams,
    private readonly navigatorService: NavigatorService,
    public loadingService: LoadingService,
    private readonly catalogProvider: CatalogsProvider
  ) {
    this.loader = loadingService.createLoader();
  }

  public ngOnInit(): void {
    this.searchString = getNavParam(this.navParams, 'searchString', 'string');
    this.category = getNavParam(this.navParams, 'category', 'object');
    this.programNumber = getNavParam(this.navParams, 'programNumber', 'string');
    this.programName = getNavParam(this.navParams, 'programName', 'string');
    this.totalNumberOfProducts = getNavParam(this.navParams, 'numberOfProductsFound', 'number');
    this.getProduct(getNavParam(this.navParams, 'searchData', 'object'));
    this.setPaginationInfo();
  }

  public sortProducts(products: Product[]): Product[] {
    return products
      .sort((product1, product2): number => {
        return product1.name.localeCompare(product2.name);
      })
      .filter(product => product.yourcost !== '-1.00');
  }

  public getProduct(data: Product[]): void {
    this.products = this.sortProducts(data);
  }

  private filterBadRequest(data: Product[]): Product[] {
    return data.length === 0 || data[0].catID === 'Bad Request' ? [] : data;
  }

  public onSearched($event: string): void {
    this.loader.show();
    this.catalogProvider.search($event, this.category ? this.category.catID : '', this.programNumber).subscribe(
      (data: any) => {
        const dataFound: Product[] = this.filterBadRequest(data);

        const params: any = {
          searchString: this.searchString,
          searchData: dataFound,
          programNumber: this.programNumber,
          programName: this.programName,
          category: this.category,
          numberOfProductsFound: dataFound[0] ? dataFound[0].totaL_REC_COUNT : 0
        };
        this.navigatorService.push(ProductsSearchPage, params, { paramsEquality: false } as NavOptions);

        this.loader.hide();
      },
      err => {
        LoadingService.hideAll();
      }
    );
  }

  public goToProductPage(product: Product): void {
    this.navigatorService
      .push(ProductPage, {
        product,
        programName: this.programName,
        programNumber: this.programNumber,
        subcategoryName: this.category ? this.category.catName : ''
      })
      .then(() => console.log('%cTo product details page', 'color:pink'));
  }

  public next(): void {
    this.page += 1;
    this.loadNextProducts();
  }

  public setPaginationInfo(): void {
    this.totalNumberOfProducts = this.products.length > 0 ? parseInt(this.products[0].totaL_REC_COUNT, 10) : 0;

    this.isPaginationEnabled = this.page * Constants.SEARCH_RESULTS_PER_PAGE < this.totalNumberOfProducts;
  }

  public loadNextProducts(): void {
    this.loader.show();
    this.getProductSubscription = this.catalogProvider
      .search(this.searchString, this.category ? this.category.catID : '', this.programNumber, this.page)
      .subscribe((response: any) => {
        this.products = this.products.concat(this.sortProducts(this.filterBadRequest(response)));
        this.setPaginationInfo();
        this.loader.hide();
      });
  }

  public ngOnDestroy(): void {
    if (this.page > 1) {
      this.getProductSubscription.unsubscribe();
    }
  }
}
