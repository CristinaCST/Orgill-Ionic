import {Injectable} from '@angular/core';
import {ApiProvider} from "../api/api";
import * as ConstantsUrl from "../../util/constants-url"
import {User} from "../../interfaces/models/user";
import * as Constants from "../../util/constants";
import {LocalStorageHelper} from "../../helpers/local-storage";
import {SearchProductRequest} from "../../interfaces/request-body/search-product";

@Injectable()
export class ScannerProvider {

  constructor(private apiProvider: ApiProvider) {
  }

  searchProduct(searchString, programNumber) {
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
    return this.apiProvider.post(ConstantsUrl.URL_PRODUCT_SEARCH, params);
  }


}
