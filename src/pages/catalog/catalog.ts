import {Component, OnInit} from '@angular/core';
import {NavController, NavParams} from 'ionic-angular';
import {Category} from "../../interfaces/models/category";
import {CategoriesRequest} from "../../interfaces/request-body/categories-request";
import * as Constants from '../../util/constants';
import {LocalStorageHelper} from "../../helpers/local-storage-helper";
import {CatalogsProvider} from "../../providers/catalogs/catalogs";
import {SubcategoriesRequest} from "../../interfaces/request-body/subcategories-request";
import {ProductsPage} from "../products/products";
import {LoadingProvider} from "../../providers/loading/loading";
import {TranslateProvider} from "../../providers/translate/translate";
import {ProductsSearchPage} from "../products-search/products-search";


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

  constructor(public navCtrl: NavController, public navParams: NavParams, public catalogProvider: CatalogsProvider,
              public loading: LoadingProvider, public translateProvider: TranslateProvider) {
  }

  ngOnInit(): void {
    this.programName = this.checkValidParams('programName', '');
    this.programNumber = this.checkValidParams('programNumber', '');
    this.catalogIndex = this.checkValidParams('catalogIndex', 0);
    this.currentSubCategory = this.checkValidParams('subcategory', undefined);

    if (!this.programName) {
      this.programName = this.translateProvider.translate(Constants.REGULAR_CATALOG);
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
    this.loading.presentLoading(this.translateProvider.translate(Constants.LOADING_ALERT_CONTENT_CATEGORIES));
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
      this.loading.hideLoading();
    });
  }

  sortCategories(responseData) {
    return responseData.sort((category1, category2): number => {
      return category1.CatName.localeCompare(category2.CatName);
    });
  }

  selectCategory(category: Category) {
    this.loading.presentLoading(this.translateProvider.translate(Constants.LOADING_ALERT_CONTENT_CATEGORIES));
    const params: SubcategoriesRequest = {
      user_token: this.userToken,
      category_id: category.CatID,
      p: '1',
      rpp: String(Constants.CATEGORIES_PER_PAGE),
      program_number: ' ',
      last_modified: '',
    };

    this.catalogProvider.getSubcategories(params).subscribe(response => {
      const responseData = JSON.parse(response.d);
      if (responseData.length > 0) {
        let categories = this.sortCategories(responseData);
        this.navCtrl.push(Catalog, {
          programName: this.programNumber,
          programNumber: this.programNumber,
          categories: categories,
          subcategory: category,
          catalogIndex: (this.catalogIndex + 1)
        });
        this.loading.hideLoading();
      } else {
        const params = {
          programNumber: this.programNumber,
          programName: this.programName,
          category: category,
        };
        this.navCtrl.push(ProductsPage, params);
        this.loading.hideLoading();
      }
    });
  }

  onSearched($event) {
    this.loading.presentSimpleLoading();
    this.catalogProvider.search($event, this.currentSubCategory ? this.currentSubCategory.CatID : '', this.programNumber).subscribe(data => {
      if (data) {
        const params = {
          searchString: $event,
          searchData: JSON.parse(data.d),
          programNumber: this.programNumber,
          programName: this.programName,
          category: this.currentSubCategory
        };
        this.navCtrl.push(ProductsSearchPage, params).then(() => console.log('%cTo product search page','color:green'));
        this.loading.hideLoading();
      }
    });
  }
}
