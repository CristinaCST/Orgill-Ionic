import { Injectable } from "@angular/core";
import * as ConstantsUrl from '../../util/constants-url'
import { USER } from '../../util/constants'
import { ApiProvider } from "../../providers/api/api";
import { LocalStorageHelper } from "../../helpers/local-storage";
import { App } from "ionic-angular";
import { ProductPage } from "../../pages/product/product";

@Injectable()
export class FlashDealService {
  private readonly userToken;

  constructor(private apiProvider: ApiProvider,
    private app: App) {
    let userInfo = JSON.parse(LocalStorageHelper.getFromLocalStorage(USER));
    if (userInfo) {
      this.userToken = userInfo.userToken;
    }
  }

  private getFlashDealsProduct(sku = '') {

    let params = {
        user_token: this.userToken,
        search_string: sku,
        category_id: '',
        program_number: '',
        p: '',
        rpp: ''
    };

  /*  let params = {
      user_token: this.userToken,
    //  isFlashDeal: true,
      sku: sku
    };*/
    return this.apiProvider.post(ConstantsUrl.URL_PRODUCT_SEARCH, params);
  }

  navigateToFlashDeal(sku = '') {
   // ;
   this.getFlashDealsProduct(sku).subscribe((receivedResponse)=>{
    let responseData = JSON.parse(receivedResponse.d);
    let foundProducts = responseData;
    foundProducts.filter(item => item.SKU === sku);
    let flashDeal = {
        isFlashDeal: true,
        SKU: sku,
        product: foundProducts[0]
    };
    this.app.getRootNavs()[0].push(ProductPage, flashDeal).catch(err => console.error(err));
   });
      
   
 //   });

    
  }
}