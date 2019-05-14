import {Component, OnInit} from '@angular/core';
import { NavParams, NavOptions} from 'ionic-angular';
import {Category} from "../../interfaces/models/category";
import {CategoriesRequest} from "../../interfaces/request-body/categories";
import * as Constants from '../../util/constants';
import * as Strings from '../../util/strings';
import {LocalStorageHelper} from "../../helpers/local-storage";
import {CatalogsProvider} from "../../providers/catalogs/catalogs";
import {SubcategoriesRequest} from "../../interfaces/request-body/subcategories";
import {ProductsPage} from "../products/products";
import {LoadingService} from "../../services/loading/loading";
import {TranslateProvider} from "../../providers/translate/translate";
import {ProductsSearchPage} from "../products-search/products-search";
import {ScannerPage} from "../scanner/scanner";
import { NavigatorService } from '../../services/navigator/navigator';


@Component({
  selector: 'page-catalog',
  templateUrl: 'catalog.html'
})
export class Catalog implements OnInit {

  programNumber: string;
  programName: string;
  categories: Category[];
  userToken: string;
  catalogIndex: number = 0;
  currentSubCategory: Category;
  menuCustomButtons = [];
  categoriesLoader: LoadingService;
  simpleLoader: LoadingService;

  constructor(public navigatorService: NavigatorService, public navParams: NavParams, public catalogProvider: CatalogsProvider,
              public loadingService: LoadingService, public translateProvider: TranslateProvider) {
    this.menuCustomButtons.push({action: 'scan', icon: 'barcode'});

    this.categoriesLoader = loadingService.createLoader(this.translateProvider.translate(Strings.LOADING_ALERT_CONTENT_CATEGORIES));
    this.simpleLoader = loadingService.createLoader();
  }

  ngOnInit(): void {
    this.programName = this.checkValidParams('programName', '');
    this.programNumber = this.checkValidParams('programNumber', '');
    this.catalogIndex = this.checkValidParams('catalogIndex', 0);
    this.currentSubCategory = this.checkValidParams('subcategory', undefined);

    if (!this.programName) {
      this.programName = this.translateProvider.translate(Strings.REGULAR_CATALOG);
    }
    if (!this.programNumber) {
      this.programNumber = '';
    }
    this.userToken = JSON.parse(LocalStorageHelper.getFromLocalStorage(Constants.USER)).userToken;
    if (this.navParams.get('categories')) {
      this.categories = this.navParams.get('categories');
    }
    else {
      this.getCategories();
    }
  }

  checkValidParams(type, value) {
    if (this.navParams.get(type)) {
      return this.navParams.get(type);
    }
    return value;
  }

  private getCategories() {
    this.categoriesLoader.show();
    const params: CategoriesRequest = {
      user_token: this.userToken,
      p: '1',
      rpp: String(Constants.CATEGORIES_PER_PAGE),
      program_number: this.programNumber,
      last_modified: '',
    };

    this.catalogProvider.getCategories(params).subscribe(response => {
      const responseData = JSON.parse(response.d);
      this.categories = this.sortCategories(responseData);
      this.categoriesLoader.hide();
    });
  }

  sortCategories(responseData) {
    return responseData.sort((category1, category2): number => {
      return category1.CatName.localeCompare(category2.CatName);
    });
  }

  selectCategory(category: Category) {
    this.categoriesLoader.show();
    const params: SubcategoriesRequest = {
      user_token: this.userToken,
      category_id: category.CatID,
      p: '1',
      rpp: String(Constants.CATEGORIES_PER_PAGE),
      program_number: this.programNumber,
      last_modified: '',
    };

    this.catalogProvider.getSubcategories(params).subscribe(response => {
      const responseData = JSON.parse(response.d);
      if (responseData.length > 0) {
        let categories = this.sortCategories(responseData);

        this.navigatorService.push(Catalog, {
          programName: category.CatName,
          programNumber: this.programNumber,
          categories: categories,
          currentSubCategory: category,
          catalogIndex: (this.catalogIndex + 1)
        }).catch(err => console.error(err));
        this.categoriesLoader.hide();
      } else {
        const params = {
          programNumber: this.programNumber,
          programName: category.CatName,
          category: category,
        };
        this.navigatorService.push(ProductsPage, params, {paramEquality:false} as NavOptions ).catch(err => console.error(err));
        this.categoriesLoader.hide();
      }
    });
  }

  onSearched($event) {
    this.simpleLoader.show();
    this.catalogProvider.search($event, this.currentSubCategory ? this.currentSubCategory.CatID : '', this.programNumber).subscribe(data => {
      if (data) {
        let dataFound = JSON.parse(data.d);
        const params = {
          searchString: $event,
          searchData: dataFound,
          programNumber: this.programNumber,
          programName: this.programName,
          category: this.currentSubCategory,
          numberOfProductsFound: dataFound[0] ? dataFound[0].TOTAL_REC_COUNT : 0
        };
        this.navigatorService.push(ProductsSearchPage, params, {paramsEquality:false} as NavOptions).then(
          //() => console.log('%cTo product search page', 'color:green')
          );
        this.simpleLoader.hide();
      }
    });
  }

  goToScanPage() {
    this.navigatorService.push(ScannerPage, {
      'type': 'scan_barcode_tab',
    }).catch(err => console.error(err));
  }
}
