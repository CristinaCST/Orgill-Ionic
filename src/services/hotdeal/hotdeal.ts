import { Injectable } from "@angular/core";
import * as ConstantsUrl from '../../util/constants-url'
import { USER } from '../../util/constants'
import { ApiProvider } from "../../providers/api/api";
import { LocalStorageHelper } from "../../helpers/local-storage";
import { App } from "ionic-angular";
import { ProductPage } from "../../pages/product/product";
import { NavigatorService } from "../navigator/navigator";
import { DatabaseProvider } from "../../providers/database/database";

@Injectable()
export class HotDealService {
  private userToken;

  constructor(private apiProvider: ApiProvider,
    private app: App,
    private navigatorService: NavigatorService,
    private databaseProvider: DatabaseProvider) {

      this.getUserInfo();
   
  }


  private getUserInfo(){
    let userToken = LocalStorageHelper.getFromLocalStorage(USER);
    if (userToken) {
      console.log("USER TOKEN:" , userToken);
      let userInfo = JSON.parse(userToken);
      if (userInfo) {
        console.log("USER INFO:" + userInfo);
        this.userToken = userInfo.userToken;
      }
    }
  }

  private getHotDealsProduct(sku = '') {

    /*
    let params = {
      'user_token': this.userToken,
      'sku': sku
    };

    return this.apiProvider.post(ConstantsUrl.GET_HOTDEALS_PRODUCT, params);*/
    //HACK: Replacement for not working backend

    if (!this.userToken) {
      this.getUserInfo();
    }
    const params = {
      'user_token': this.userToken,
      'division': "",
      'price_type': "",
      'search_string': "'"+ sku + "'",
      'category_id': '-1',
      'program_number': "",
      'p': '1',
      'rpp': '1',
      'last_modified': ''
    };

    //console.log("SEARCH PROD params object",params);
    return this.apiProvider.post(ConstantsUrl.URL_PRODUCT_SEARCH, params);
  }

  navigateToHotDeal(sku = '') {
    console.log("NAVIGATE CALLED");
    this.getHotDealsProduct(sku).subscribe((receivedResponse) => {
      let responseData = JSON.parse(receivedResponse.d);
      console.log("RECEIVED RESP:",receivedResponse);
      let foundProducts = responseData;
      console.log("FOUNJDPRODUCTS:",foundProducts);
      if (foundProducts.length>0) {
        console.log("PRODUCT IS OK");
        foundProducts.filter(item => item.SKU === sku);
        let hotDeal = {
          isHotDeal: true,
          SKU: sku,
          product: foundProducts[0]
        };

        this.navigatorService.push(ProductPage, hotDeal).catch(err => console.error(err));
      }
    });
    
  }
/*
  orderHotDeal(itemsIdsArr, shoppingListId) {

    let productListInfo = {
      order_method: ???
      order_query: this.getOrderQuery(programNumber, orderItems)
    };

    let insertToDBInfo = {
      PO: this.postOffice,
      date: moment().format('MM/DD/YYYY'),
      location: this.location.SHIPTONO,
      type: this.orderMethod,
      total: this.orderTotal,
      program_number: programNumber
    };


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
*/

}