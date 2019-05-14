import { Injectable } from '@angular/core';
import {Product} from "../../interfaces/models/product";
import * as Constants from '../../util/constants';
import * as ConstantsUrl from "../../util/constants-url"
import {User} from "../../interfaces/models/user";
import {LocalStorageHelper} from "../../helpers/local-storage";
import {SearchProductRequest} from "../../interfaces/request-body/search-product";
import { ApiProvider } from '../../providers/api/api';


@Injectable()
export class ProductProvider {

  constructor(private apiProvider: ApiProvider){

  }

  isYCategoryProduct(product: Product): boolean {
    return product.QTY_ROUND_OPTION === 'Y';
  }

  isXCategoryProduct(product: Product): boolean {
    return product.QTY_ROUND_OPTION === 'X';

  }

  getItemPrice(product: Product, initialPrice: number, quantity: number): number {
    let newPrice = 0;

    if (this.isYCategoryProduct(product) && quantity < Number(product.SHELF_PACK)) {
      newPrice = Number(initialPrice + (initialPrice * 4 / 100));
    } else {
      newPrice = Number(initialPrice);
    }

    return Number(newPrice.toFixed(Constants.DECIMAL_NUMBER));
  }


  protected isProductInList(listId: number, listsThatContainProduct: number[] ): boolean {
    return listsThatContainProduct.indexOf(listId) > -1;
  }

  public searchProduct(searchString, programNumber) {
    const user: User = JSON.parse(LocalStorageHelper.getFromLocalStorage(Constants.USER));
    const params: SearchProductRequest = {
      'user_token': user.userToken,
      'division': user.division,
      'price_type': user.price_type,
      'search_string': searchString,
      'category_id': '-1',
      'program_number': programNumber,
      'p': '1',
      'rpp': String(Constants.SEARCH_RESULTS_PER_PAGE),
      'last_modified': ''
    };

    //console.log("SEARCH PROD params object",params);
    return this.apiProvider.post(ConstantsUrl.URL_PRODUCT_SEARCH, params);
  }




}
