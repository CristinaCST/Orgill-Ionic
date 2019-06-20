import { Injectable } from '@angular/core';
import { Product } from '../../interfaces/models/product';
import * as Constants from '../../util/constants';
import * as ConstantsUrl from '../../util/constants-url';
import { SearchProductRequest } from '../../interfaces/request-body/search-product';
import { ApiService } from '../../services/api/api';
import { Observable } from 'rxjs';
import { APIResponse } from '../../interfaces/response-body/response';
import { AuthService } from '../../services/auth/auth';


@Injectable()
export class ProductProvider {

constructor(private readonly apiProvider: ApiService, private readonly authService: AuthService) {}

public isYCategoryProduct(product: Product): boolean {
    return product.QTY_ROUND_OPTION === 'Y';
  }

public isXCategoryProduct(product: Product): boolean {
    return product.QTY_ROUND_OPTION === 'X';
  }

protected isProductInList(listId: number, listsThatContainProduct: number[]): boolean {
    return listsThatContainProduct.indexOf(listId) > -1;
  }

  public searchProduct(searchString: string, programNumber: string): Observable<APIResponse> {

    const params: SearchProductRequest = {
      'user_token': this.authService.userToken,
      'division': this.authService.User.division,
      'price_type': this.authService.User.price_type,
      'search_string': searchString,
      'category_id': '',
      'program_number': programNumber,
      'p': '1',
      'rpp': String(Constants.SEARCH_RESULTS_PER_PAGE),
      'last_modified': ''
    };

    return this.apiProvider.post(ConstantsUrl.URL_PRODUCT_SEARCH, params);
  }

  public getProduct(sku: string, programNumber: string): Observable<Product> {
    const params: any = {
      'user_token': this.authService.userToken,
      'division': this.authService.User.division,
      'price_type': this.authService.User.price_type,
      'search_string': '\'' + sku + '\'',
      'category_id': '',
      'program_number': programNumber,
      'rpp': '1',
      'p': '1'
    };

    return this.apiProvider.post(ConstantsUrl.URL_PRODUCT_SEARCH, params).map(result => {
      if (result) {
        return JSON.parse(result.d)[0];
      }
      return Observable.of([]);
    });
  }

public orderHotDeal(productInfoList: any): Promise<APIResponse> {
    return new Promise((resolve, reject) => {
      productInfoList.user_token = this.authService.userToken;
      try {
        this.apiProvider.post(ConstantsUrl.URL_ORDER_HOT_DEAL_PRODUCTS, productInfoList).subscribe(response => {
          if (response) {
              resolve(response);

          } else {
            reject();
          }
        });
      } catch (e) {
        reject(e);
      }
    }
    );
  }


}
