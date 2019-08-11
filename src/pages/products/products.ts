import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavParams, NavOptions } from 'ionic-angular';
import { Product } from '../../interfaces/models/product';
import { CatalogsProvider } from '../../providers/catalogs/catalogs';
import { ProductPage } from '../product/product';
import { Category } from '../../interfaces/models/category';
import { Subscription } from 'rxjs/Subscription';
import { ProductsSearchPage } from '../products-search/products-search';
import { LoadingService } from '../../services/loading/loading';
import * as Constants from '../../util/constants';
import { NavigatorService } from '../../services/navigator/navigator';
import { getNavParam } from '../../helpers/validatedNavParams';
import { Events } from 'ionic-angular/util/events';

@Component({
  selector: 'page-products',
  templateUrl: 'products.html'
})

export class ProductsPage implements OnInit, OnDestroy {
  private getProductSubscription: Subscription;
  private programName: string;
  private programNumber: string;
  public isPaginationEnabled: boolean = false;
  public totalNumberOfProducts: number = 0;
  public category: Category;
  public page: number = 1;
  public products: Product[] = [];
  public isLoading: boolean = true;
  private readonly loader: LoadingService;

  constructor(private readonly navParams: NavParams,
              public loadingService: LoadingService,
              private readonly catalogProvider: CatalogsProvider,
              private readonly navigatorService: NavigatorService,
              private readonly events: Events) {

                this.loader = loadingService.createLoader();
  }

  public ngOnInit(): void {
    this.events.subscribe(Constants.EVENT_LOADING_FAILED, this.loadingFailedHandler);
    this.init();
  }

  public ngOnDestroy(): void {
    this.events.unsubscribe(Constants.EVENT_LOADING_FAILED, this.loadingFailedHandler);

    if (this.page > 1) {
      this.getProductSubscription.unsubscribe();
    }
  }

  private readonly loadingFailedHandler = (culprit?: string): void => {
    if (culprit === 'products' || !culprit) {
      this.init();
    }
  }

  private init(): void {
    this.programNumber = getNavParam(this.navParams, 'programNumber', 'string');
    this.programName = getNavParam(this.navParams, 'programName', 'string');
    this.category = getNavParam(this.navParams, 'category', 'object');

    this.getProducts();
    this.setPaginationInfo();
  }

  public getProducts(): void {
    this.loader.show();
    this.getProductSubscription = this.catalogProvider.getProducts(this.category ? this.category.CatID : '', this.programNumber, this.page).subscribe(response => {
      this.products = this.sortProducts(JSON.parse(response.d));
      this.loader.hide();
      this.isLoading = false;
      this.setPaginationInfo();
    }, err => {
      this.loader.hide();
     // this.reloadService.paintDirty('products');
    });
  }

  public sortProducts(products: Product[]): Product[] {
    return products.sort((product1, product2): number =>
      product1.NAME.localeCompare(product2.NAME)
    );
  }

  // TODO: Why this appears 2 times, now 3...?
  public goToProductPage(product: Product): void {
    this.navigatorService.push(ProductPage, {
      'product': product,
      'programName': this.programName,
      'programNumber': this.programNumber
    }).then(() => {
      // console.log('%cTo product details page', 'color:pink');
    });
  }

  public onSearched($event: string): void {
    this.loader.show();
    this.catalogProvider.search($event, this.category ? this.category.CatID : '', this.programNumber).subscribe(data => {
      const dataFound: Product[] = JSON.parse(data.d);
      const params: any = {
        searchData: dataFound,
        programNumber: this.programNumber,
        programName: this.programName,
        category: this.category,
        numberOfProductsFound: dataFound[0] ? dataFound[0].TOTAL_REC_COUNT : 0
      };
      this.loader.hide();
      this.navigatorService.push(ProductsSearchPage, params, { paramsEquality: false } as NavOptions).then(
       // () => console.log('%cTo product search page', 'color:blue')
        );
    }, err => {
      LoadingService.hideAll();
    });
  }

  public next(): void {
    this.page += 1;
    this.loadNextProducts();
  }

  public loadNextProducts(): void {
    this.loader.show();
    this.getProductSubscription = this.catalogProvider.getProducts(this.category ? this.category.CatID : '', this.programNumber, this.page)
      .subscribe(response => {
        this.products = this.products.concat(this.sortProducts(JSON.parse(response.d)));
        this.setPaginationInfo();
        this.loader.hide();
      });
  }

  public setPaginationInfo(): void {
    if (this.products.length > 0) {
      this.totalNumberOfProducts = parseInt(this.products[0].TOTAL_REC_COUNT, 10);
    }
    this.isPaginationEnabled = this.page * Constants.PRODUCTS_PER_PAGE < this.totalNumberOfProducts;
  }
}
