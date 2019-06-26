import { Component, OnInit } from '@angular/core';
import { NavParams, NavOptions } from 'ionic-angular';
import { Category } from '../../interfaces/models/category';
import { CategoriesRequest } from '../../interfaces/request-body/categories';
import * as Constants from '../../util/constants';
import * as Strings from '../../util/strings';
import { CatalogsProvider } from '../../providers/catalogs/catalogs';
import { SubcategoriesRequest } from '../../interfaces/request-body/subcategories';
import { ProductsPage } from '../products/products';
import { LoadingService } from '../../services/loading/loading';
import { TranslateWrapperService } from '../../services/translate/translate';
import { ProductsSearchPage } from '../products-search/products-search';
import { ScannerPage } from '../scanner/scanner';
import { NavigatorService } from '../../services/navigator/navigator';
import { Product } from '../../interfaces/models/product';
import { getNavParam } from '../../util/validatedNavParams';
import { AuthService } from '../../services/auth/auth';


@Component({
  selector: 'page-catalog',
  templateUrl: 'catalog.html'
})
export class Catalog implements OnInit {

  public programNumber: string;
  public programName: string;
  public categories: Category[];
  public catalogIndex: number;
  public currentSubCategory: Category;
  public menuCustomButtons: any[] = [];
  public categoriesLoader: LoadingService;
  public simpleLoader: LoadingService;

  constructor(public navigatorService: NavigatorService, public navParams: NavParams, public catalogProvider: CatalogsProvider,
              public loadingService: LoadingService, public translateProvider: TranslateWrapperService, private readonly authService: AuthService) {
    this.menuCustomButtons.push({ action: 'scan', icon: 'barcode' });

    this.categoriesLoader = loadingService.createLoader(this.translateProvider.translate(Strings.LOADING_ALERT_CONTENT_CATEGORIES));
    this.simpleLoader = loadingService.createLoader();
  }

  public ngOnInit(): void {
    this.programName = getNavParam(this.navParams, 'programName', 'string');
    this.programNumber = getNavParam(this.navParams, 'programNumber', 'number');
    this.catalogIndex = getNavParam(this.navParams, 'catalogIndex', 'number', 0);
    this.currentSubCategory = getNavParam(this.navParams, 'subcategory', 'object');

    if (!this.programName) {
      this.programName = this.translateProvider.translate(Strings.REGULAR_CATALOG);
    }
    if (!this.programNumber) {
      this.programNumber = '';
    }
    const categoriesFromNavParam: Category[] = getNavParam(this.navParams, 'categories', 'object');
    if (categoriesFromNavParam) {
      this.categories = categoriesFromNavParam;
    } else {
      this.getCategories();
    }
  }

  private getCategories(): void {
    this.categoriesLoader.show();
    const params: CategoriesRequest = {
      user_token: this.authService.userToken,
      p: '1',
      rpp: String(Constants.CATEGORIES_PER_PAGE),
      program_number: this.programNumber,
      last_modified: ''
    };

    this.catalogProvider.getCategories(params).subscribe(response => {
      const responseData: Category[] = JSON.parse(response.d);
      this.categories = this.sortCategories(responseData);
      this.categoriesLoader.hide();
    });
  }

  public sortCategories(responseData: Category[]): Category[] {
    return responseData.sort((category1, category2): number => {
      return category1.CatName.localeCompare(category2.CatName);
    });
  }

  public selectCategory(category: Category): void {
    this.categoriesLoader.show();
    const params: SubcategoriesRequest = {
      user_token: this.authService.userToken,
      category_id: category.CatID,
      p: '1',
      rpp: String(Constants.CATEGORIES_PER_PAGE),
      program_number: this.programNumber,
      last_modified: ''
    };

    this.catalogProvider.getSubcategories(params).subscribe(response => {
      const responseData: Category[] = JSON.parse(response.d);
      if (responseData.length > 0) {
        const categories: Category[] = this.sortCategories(responseData);
        this.navigatorService.push(Catalog, {
          programName: category.CatName,
          programNumber: this.programNumber,
          categories,
          currentSubCategory: category,
          catalogIndex: (this.catalogIndex + 1)
        }).catch(err => console.error(err));
        this.categoriesLoader.hide();
      } else {
        const productsPageParams: any = {
          programNumber: this.programNumber,
          programName: category.CatName,
          category
        };
        this.navigatorService.push(ProductsPage, productsPageParams, { paramEquality: false } as NavOptions).catch(err => console.error(err));
        this.categoriesLoader.hide();
      }
    });
  }

  public onSearched($event: any): void {
    this.simpleLoader.show();
    this.catalogProvider.search($event, this.currentSubCategory ? this.currentSubCategory.CatID : '', this.programNumber).subscribe(data => {
      if (data) {
        const dataFound: Product[] = JSON.parse(data.d);
        const params: any = {
          searchString: $event,
          searchData: dataFound,
          programNumber: this.programNumber,
          programName: this.programName,
          category: this.currentSubCategory,
          numberOfProductsFound: dataFound[0] ? dataFound[0].TOTAL_REC_COUNT : 0
        };
        this.navigatorService.push(ProductsSearchPage, params, { paramsEquality: false } as NavOptions).then(
          // () => console.log('%cTo product search page', 'color:green')
          );
        this.simpleLoader.hide();
      }
    });
  }

  public goToScanPage(): void {
    this.navigatorService.push(ScannerPage, {
      'type': 'scan_barcode_tab'
    }).catch(err => console.error(err));
  }
}
