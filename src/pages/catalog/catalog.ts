import {Component, OnInit} from '@angular/core';
import {LoadingController, NavController, NavParams} from 'ionic-angular';
import {Category} from "../../interfaces/models/category";
import {CategoriesRequest} from "../../interfaces/request-body/categories-request";
import * as Constants from '../../util/constants';
import {LocalStorageHelper} from "../../helpers/local-storage-helper";
import {ApiProvider} from "../../providers/api-provider";
import {CatalogsProvider} from "../../providers/catalogs/catalogs";
import {SubcategoriesRequest} from "../../interfaces/request-body/subcategories-request";
import {Product} from "../../interfaces/models/product";
import {ProductsPage} from "../products/products";
import {LoadingProvider} from "../../providers/loading/loading";
import {TranslateProvider} from "../../providers/translate/translate";


@Component({
  selector: 'page-catalog',
  templateUrl: 'catalog.html'
})
export class Catalog implements OnInit{

  programNumber: string;
  programName: string;
  categories : Category[];
  userToken: string;


  constructor(public navCtrl: NavController, public navParams: NavParams, public apiProvider : ApiProvider, public catalogProvider : CatalogsProvider, public loading : LoadingProvider, public translateProvider : TranslateProvider) {
    //TODO: put from menu program name and program number
    this.programName = this.navParams.get('programName');
    this.programNumber = this.navParams.get('programNumber');
    this.userToken = JSON.parse(LocalStorageHelper.getFromLocalStorage(Constants.USER)).userToken;

  }

  ngOnInit(): void {
    if(this.navParams.get('categories')){
      this.categories = this.navParams.get('categories');
    }
    else {
      this.getCategories(this.programNumber);
    }
  }

  private getCategories(programNumber){
    this.loading.presentLoading(this.translateProvider.translate(Constants.LOADING_ALERT_CONTENT_CATEGORIES));
    const params: CategoriesRequest = {
      'user_token': this.userToken,
      'p': '1',
      'rpp': String(Constants.CATEGORIES_PER_PAGE),
      'program_number': programNumber,
      'last_modified': '',
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

  getSubCategoryOrProducts(category : Category){
    this.loading.presentLoading(this.translateProvider.translate(Constants.LOADING_ALERT_CONTENT_CATEGORIES));
    const params: SubcategoriesRequest = {
      'user_token': this.userToken,
      'category_id': category.CatID,
      'p': '1',
      'rpp': String(Constants.CATEGORIES_PER_PAGE),
      'program_number': ' ',
      'last_modified': '',
    };

    this.catalogProvider.getSubcategories(params).subscribe(response => {
      const responseData = JSON.parse(response.d);
      if(responseData.length > 0){
        let categories = this.sortCategories(responseData);
        this.navCtrl.push(Catalog, {categories});
        this.loading.hideLoading();
      }
      else{
        this.loading.hideLoading();
        const params = {
          'subCategoryId': category.CatID,
          'programNumber' : this.programNumber
        };
        this.navCtrl.push(ProductsPage, params);
      }
    })
  }

}
