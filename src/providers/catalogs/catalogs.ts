import { Injectable } from '@angular/core';
import { LocalStorageHelper } from '../../helpers/local-storage';
import * as ConstantsUrl from '../../util/constants-url';
import * as Constants from '../../util/constants';
import { ApiService } from '../../services/api/api';
import { SubcategoriesRequest } from '../../interfaces/request-body/subcategories';
import { CategoriesRequest } from '../../interfaces/request-body/categories';
import { ProductsRequest } from '../../interfaces/request-body/products';
import { EmptyObservable } from 'rxjs/observable/EmptyObservable';
import { SearchProductRequest } from '../../interfaces/request-body/search-product';

@Injectable()
export class CatalogsProvider {

  private readonly user: any;

  constructor(private apiProvider: ApiService) {
    const userInfo = JSON.parse(LocalStorageHelper.getFromLocalStorage(Constants.USER));
    if (userInfo) {
      this.user = userInfo;
    }
  }

  public getPrograms() {
    if (this.user) {
      const params = { 'user_token': this.user.userToken };
      return this.apiProvider.post(ConstantsUrl.URL_PROGRAMS, params);
    } else {
      return new EmptyObservable;
    }
  }

  public getCategories(params: CategoriesRequest) {
    return this.apiProvider.post(ConstantsUrl.URL_CATEGORIES, params);
  }

  public getSubcategories(params: SubcategoriesRequest) {
    return this.apiProvider.post(ConstantsUrl.URL_SUBCATEGORIES, params);
  }

  public getProducts(categoryId, programNumber, page = 0, rpp = Constants.PRODUCTS_PER_PAGE, lastModified = '') {
    const params: ProductsRequest = {
      user_token: this.user.userToken,

      subcategory_id: categoryId,
      p: page + '',
      rpp: rpp + '',
      program_number: programNumber,
      last_modified: lastModified
    };
    return this.apiProvider.post(ConstantsUrl.URL_PRODUCTS, params);
  }

  public getProductDetails(productSku) {
    const params = {
      'user_token': this.user.userToken,
      'sku': productSku
    };
    return this.apiProvider.post(ConstantsUrl.URL_PRODUCT_DETAIL, params);
  }

  public search(searchString, categoryId, programNumber, page = 1) {
    const params: SearchProductRequest = {
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
