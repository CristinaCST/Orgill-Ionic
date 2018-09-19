import {Injectable} from '@angular/core';
import {LocalStorageHelper} from "../../helpers/local-storage-helper";
import * as ConstantsUrl from "../../util/constants-url";
import * as Constants from "../../util/constants";
import {ApiProvider} from "../api-provider";
import {SubcategoriesRequest} from "../../interfaces/request-body/subcategories-request";
import {CategoriesRequest} from "../../interfaces/request-body/categories-request";
import {ProductsRequest} from "../../interfaces/request-body/products-request";
import {EmptyObservable} from "rxjs/observable/EmptyObservable";

@Injectable()
export class CatalogsProvider {

  private readonly userToken;

  constructor(private apiProvider: ApiProvider) {
    let userInfo = JSON.parse(LocalStorageHelper.getFromLocalStorage(Constants.USER));
    if (userInfo) {
      this.userToken = userInfo.userToken;
    }
  }

  getPrograms() {
    if (this.userToken) {
      let params = {"user_token": this.userToken};
      return this.apiProvider.post(ConstantsUrl.URL_PROGRAMS, params);
    } else {
      return new EmptyObservable;
    }
  }

  getCategories(params: CategoriesRequest){
    return this.apiProvider.post(ConstantsUrl.URL_CATEGORIES, params);
  }

  getSubcategories(params: SubcategoriesRequest) {
    return this.apiProvider.post(ConstantsUrl.URL_SUBCATEGORIES, params);
  }

  getProducts(params: ProductsRequest) {
    return this.apiProvider.post(ConstantsUrl.URL_PRODUCTS, params);
  }

}
