import {Injectable} from '@angular/core';
import {LocalStorageHelper} from "../../helpers/local-storage-helper";
import * as ConstantsUrl from "../../util/constants-url";
import * as Constants from "../../util/constants";
import {ApiProvider} from "../api-provider";
import {SubcategoriesRequest} from "../../interfaces/request-body/subcategories-request";
import {CategoriesRequest} from "../../interfaces/request-body/categories-request";
import {ProductsRequest} from "../../interfaces/request-body/products-request";
import {EmptyObservable} from "rxjs/observable/EmptyObservable";
import {SearchProductRequest} from "../../interfaces/request-body/search-product-request";

@Injectable()
export class CatalogsProvider {

  private readonly user;

  constructor(private apiProvider: ApiProvider) {
    let userInfo = JSON.parse(LocalStorageHelper.getFromLocalStorage(Constants.USER));
    if (userInfo) {
      this.user = userInfo;
    }
  }

  getPrograms() {
    if (this.user) {
      let params = {"user_token": this.user.userToken};
      return this.apiProvider.post(ConstantsUrl.URL_PROGRAMS, params);
    } else {
      return new EmptyObservable;
    }
  }

  getCategories(params: CategoriesRequest) {
    return this.apiProvider.post(ConstantsUrl.URL_CATEGORIES, params);
  }

  getSubcategories(params: SubcategoriesRequest) {
    return this.apiProvider.post(ConstantsUrl.URL_SUBCATEGORIES, params);
  }

  getProducts(categoryId, programNumber, page = 0, rpp = Constants.PRODUCTS_PER_PAGE, lastModified = '') {
    let params: ProductsRequest = {
      user_token: this.user.userToken,
      subcategory_id: categoryId,
      p: page + '',
      rpp: rpp + '',
      program_number: programNumber,
      last_modified: lastModified
    };
    return this.apiProvider.post(ConstantsUrl.URL_PRODUCTS, params);
  }

  getProductDetails(productSku) {
    let params = {
      "user_token": this.user.userToken,
      "sku": productSku
    };
    return this.apiProvider.post(ConstantsUrl.URL_PRODUCT_DETAIL, params);
  }

  search(searchString, categoryId, programNumber, page = 1) {
    let params: SearchProductRequest = {
      user_token: this.user.userToken,
      division: this.user.division,
      price_type: this.user.price_type,
      search_string: searchString,
      category_id: categoryId,
      program_number: programNumber,
      p: page + '',
      rpp: String(Constants.SEARCH_RESULTS_PER_PAGE),
      last_modified: ''
    };
    return this.apiProvider.post(ConstantsUrl.URL_PRODUCT_SEARCH, params);
  }
}
