import {Injectable} from '@angular/core';
import {ApiProvider} from "../api-provider";
import * as ConstantsUrl from "../../util/constants-url"

@Injectable()
export class ScannerProvider {

  constructor(private apiProvider: ApiProvider) {

  }

  searchProduct(requestBody) {
    console.log('reqB', requestBody)
    return this.apiProvider.post(ConstantsUrl.URL_PRODUCT_SEARCH, requestBody);
  }


}
