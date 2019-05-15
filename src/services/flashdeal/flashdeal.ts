import { Injectable } from "@angular/core";
import * as ConstantsUrl from '../../util/constants-url'
import { USER } from '../../util/constants'
import { ApiProvider } from "../../providers/api/api";
import { LocalStorageHelper } from "../../helpers/local-storage";
import { App } from "ionic-angular";
import { ProductPage } from "../../pages/product/product";
import { NavigatorService } from "../../services/navigator/navigator";
import { DatabaseProvider } from "../../providers/database/database";

@Injectable()
export class FlashDealService {
  private readonly userToken;

  constructor(private apiProvider: ApiProvider,
    private app: App,
    private navigatorService: NavigatorService,
    private databaseProvider: DatabaseProvider) {
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

    this.navigatorService.push(ProductPage, flashDeal).catch(err => console.error(err));
   });
    
  }

  orderFlashDeal(productInfoList, insertToDBInfo, itemsIdsArr, shoppingListId) {
    return new Promise((resolve, reject) => {
        productInfoList.user_token = this.userToken;
        try {
          this.apiProvider.post(ConstantsUrl.URL_SHOPPING_LISTS_ORDER_PRODUCTS, productInfoList).subscribe(async (response) => {
            if (response) {
              insertToDBInfo.confirmation_number = JSON.parse(response.d);
              let insertedPurchaseToDBInfo = await this.insertPurchaseToDB(insertToDBInfo);
              let removedItemsFromShoppingList = await this.deleteItemsFromList(insertedPurchaseToDBInfo.insertId, itemsIdsArr, shoppingListId);
              resolve({
                insertedPurchaseToDBInfo: insertedPurchaseToDBInfo, confirmationNumber: JSON.parse(response.d),
                removedItemsFromShoppingList: removedItemsFromShoppingList
              });
            } else {
              reject(response);
            }
          })
        } catch (e) {
          reject(e);
        }
      }
    )
  }

  insertPurchaseToDB(purchaseInfo) {
    return this.databaseProvider.insertPurchase(purchaseInfo);
  }

  deleteItemsFromList(insertId, itemsIdsArr, shoppingListId) {
    return this.databaseProvider.finalizePurchase(insertId, itemsIdsArr, shoppingListId);
  }


}