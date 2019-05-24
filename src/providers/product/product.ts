import { Injectable } from '@angular/core';
import {Product} from "../../interfaces/models/product";
import * as Constants from '../../util/constants';
import * as ConstantsUrl from "../../util/constants-url"
import {User} from "../../interfaces/models/user";
import {LocalStorageHelper} from "../../helpers/local-storage";
import {SearchProductRequest} from "../../interfaces/request-body/search-product";
import { ApiProvider } from '../../providers/api/api';
import { PricingService } from '../../services/pricing/pricing';


@Injectable()
export class ProductProvider {
private readonly userToken;
  constructor(private apiProvider: ApiProvider, private pricingService: PricingService){
    let userInfo = JSON.parse(LocalStorageHelper.getFromLocalStorage(Constants.USER));
    if (userInfo) {
      this.userToken = userInfo.userToken;
    }
  }

  isYCategoryProduct(product: Product): boolean {
    return product.QTY_ROUND_OPTION === 'Y';
  }

  isXCategoryProduct(product: Product): boolean {
    return product.QTY_ROUND_OPTION === 'X';

  }


  /*
  getItemPrice(product: Product, initialPrice: number, quantity: number): number {
    return this.pricingService.getPrice(quantity, product);   
  }*/


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

  orderHotDeal(productInfoList) {
    return new Promise((resolve, reject) => {
      productInfoList.user_token = this.userToken;
      try {
        this.apiProvider.post(ConstantsUrl.URL_ORDER_HOT_DEAL_PRODUCTS, productInfoList).subscribe((response) => {
          if (response) {
              resolve(response);
            
          } else {
            reject();
          }
        })
      } catch (e) {
        reject(e);
      }
    }
    );
  }



}
