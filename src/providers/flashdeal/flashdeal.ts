import { Injectable } from "@angular/core";
import {GET_FLASHDEALS_PRODUCT} from '../../util/constants-url'
import {USER} from '../../util/constants'
import { ApiProvider } from "../../providers/api-provider";
import { LocalStorageHelper } from "../../helpers/local-storage-helper";

@Injectable()
export class FlashDealProvider{
   private readonly userToken;
    
     constructor(private apiProvider: ApiProvider) {
        let userInfo = JSON.parse(LocalStorageHelper.getFromLocalStorage(USER));
        if (userInfo) {
          this.userToken = userInfo.userToken;
        }
      }

    private getFlashDealsProduct(sku = ''){
        let params={
          user_token: this.userToken,
          isFlashDeal: true,
          sku:sku
        };
        return this.apiProvider.post(GET_FLASHDEALS_PRODUCT,params)
      }

    navigateToFlashDeal(sku = ''){
        return this.getFlashDealsProduct(sku);
    }
}