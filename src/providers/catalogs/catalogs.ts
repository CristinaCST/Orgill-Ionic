import { Injectable } from '@angular/core';
import * as ConstantsUrl from '../../util/constants-url';
import * as Constants from '../../util/constants';
import { ApiService } from '../../services/api/api';
import { SubcategoriesRequest } from '../../interfaces/request-body/subcategories';
import { CategoriesRequest } from '../../interfaces/request-body/categories';
import { ProductsRequest } from '../../interfaces/request-body/products';
import { SearchProductRequest } from '../../interfaces/request-body/search-product';
import { Observable } from 'rxjs/Observable';
import { APIResponse } from '../../interfaces/response-body/response';
import { SecureActionsService } from '../../services/secure-actions/secure-actions';

@Injectable()
export class CatalogsProvider {

  constructor(private readonly apiProvider: ApiService,
              private readonly secureActions: SecureActionsService) { }

  public getPrograms(): Observable<APIResponse> {
        return this.apiProvider.post(ConstantsUrl.URL_PROGRAMS, {}, true) as Observable<APIResponse>;
  }

  public getCategories(params: CategoriesRequest): Observable<APIResponse> {
    return this.apiProvider.post(ConstantsUrl.URL_CATEGORIES, params, true);
  }

  public getSubcategories(params: SubcategoriesRequest): Observable<APIResponse> {
    return this.apiProvider.post(ConstantsUrl.URL_SUBCATEGORIES, params, true);
  }

  public getProducts(categoryId: string, programNumber: string, page: number = 0, rpp: number = Constants.PRODUCTS_PER_PAGE, lastModified: string = ''): Observable<APIResponse> {
    const params: ProductsRequest = {
      subcategory_id: categoryId,
      p: page + '',
      rpp: rpp + '',
      program_number: programNumber ? programNumber : '',
      last_modified: lastModified
    };
    return this.apiProvider.post(ConstantsUrl.URL_PRODUCTS, params, true);
  }

  public getProductDetails(productSku: string): Observable<APIResponse> {
    const params: any = {
      sku: productSku
    };
    return this.apiProvider.post(ConstantsUrl.URL_PRODUCT_DETAIL, params, true);
  }

  public search(searchString: string, categoryId: string, programNumber: string, page: number = 1): Observable<APIResponse> {
    return this.secureActions.waitForAuth().flatMap(user => {
      const params: SearchProductRequest = {
        division: user.division,
        price_type: user.price_type,
        search_string: searchString,
        category_id: categoryId,
        program_number: programNumber,
        p: page + '',
        rpp: String(Constants.SEARCH_RESULTS_PER_PAGE),
        last_modified: ''
      };
      return this.apiProvider.post(ConstantsUrl.URL_PRODUCT_SEARCH, params, true);
    });
    
  }
}
