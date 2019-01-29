import {Injectable} from '@angular/core';
import {DatabaseProvider} from "../database/database";
import {ShoppingListItem} from "../../interfaces/models/shopping-list-item";
import {DateTime} from "../datetime/DateTime";
import {ApiProvider} from "../api-provider";
import * as ConstantsUrl from "../../util/constants-url";
import * as Constants from "../../util/constants";
import {LocalStorageHelper} from "../../helpers/local-storage-helper";

@Injectable()
export class ShoppingListsProvider {
  private readonly userToken;

  constructor(private databaseProvider: DatabaseProvider, private apiProvider: ApiProvider) {
    let userInfo = JSON.parse(LocalStorageHelper.getFromLocalStorage(Constants.USER));
    if (userInfo) {
      this.userToken = userInfo.userToken;
    }
  }

  getLocalShoppingLists(): Promise<any> {
    return this.databaseProvider.getAllShoppingLists();
  }

  addItemToShoppingList(listId: number, shoppingListItem: ShoppingListItem): Promise<any> {
    return this.databaseProvider.addProductToShoppingList(listId, shoppingListItem);
  }

  getShoppingListForProduct(productSKU: string): Promise<any> {
    return this.databaseProvider.getShoppingListsForProduct(productSKU);
  }

  createNewShoppingList(name, description = '', type = 'default') {
    return this.databaseProvider.addShoppingList(name, description, type);
  }

  checkNameAvailability(name): Promise<any> {
    return new Promise((resolve, reject) => {
      this.databaseProvider.getNumOfListsWithName(name).then(data => {
        if (data.rows.item(0).list_num === 0) {
          resolve('available');
        }
        else {
          resolve('unavailable');
        }
      }).catch(error => reject(error));
    });
  }

  private isExpiredProgram(date) {
    const now = DateTime.getCurrentDateTime();
    const endDate = DateTime.dateInMonthDayYearFormat(date);
    return now.isAfter(endDate);
  }

  private setProducts(data) {
    let list = [];
    if (data.rows.length > 0) {
      for (let i = 0; i < data.rows.length; i++) {
        let item = data.rows.item(i);
        let shoppingListProduct: ShoppingListItem = {
          id: item.id,
          product: {
            CatID: item.cat_id,
            SKU: item.sku,
            QTY_ROUND_OPTION: item.qty_round_option,
            MODEL: item.model,
            NAME: item.name,
            VENDOR_NAME: item.vendor_name,
            SELLING_UNIT: item.selling_unit,
            UPC_CODE: item.upc_code,
            SUGGESTED_RETAIL: item.suggested_retail,
            YOURCOST: item.your_cost,
            IMAGE: item.image,
            SHELF_PACK: item.shelf_pack,
            VELOCITY_CODE: item.velocity_code,
            TOTAL_REC_COUNT: item.total_rec_count
          },
          program_number: item.program_number,
          item_price: item.item_price,
          quantity: item.quantity,
          isCheckedInShoppingList: false,
          isExpired: this.isExpiredProgram(item.end_date)
        };
        list.push(shoppingListProduct)
      }
    }
    return list;
  }

  getAllProductsInShoppingList(listId) {
    return new Promise((resolve, reject) => {
      this.databaseProvider.getAllProductsFromShoppingList(listId).then(data => {
        let productList = this.setProducts(data);
        resolve(productList);
      }).catch(error => reject(error));
    });
  }

  deleteProductFromList(listId, productIdsArr) {
    return this.databaseProvider.removeProductsFromShoppingList(listId, productIdsArr);
  }

  insertPurchaseToDB(purchaseInfo) {
    return this.databaseProvider.insertPurchase(purchaseInfo);
  }

  deleteItemsFromList(insertId, itemsIdsArr, shoppingListId) {
    return this.databaseProvider.finalizePurchase(insertId, itemsIdsArr, shoppingListId);
  }

  orderProducts(productInfoList, insertToDBInfo, itemsIdsArr, shoppingListId) {
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

  getOrderConfirmation(confirmationNumbers) {
    let params = {
      "user_token": this.userToken,
      "confirmation_numbers": confirmationNumbers
    };
    return this.apiProvider.post(ConstantsUrl.URL_SHOPPING_LISTS_ORDER_CONFIRMATION, params);
  }

  search(shoppingListItems, searchString) {
    let searchFn = (value) => value.toLocaleLowerCase().search(searchString.toLowerCase()) !== -1;
    return shoppingListItems.filter(item => searchFn(item.product.NAME) || searchFn(item.product.SKU) || searchFn(item.product.UPC_CODE));
  }

  updateShoppingListItem(id: number, shoppingListId: number, programNumber: string, price: number, quantity: number) {
    return this.databaseProvider.updateShoppingListItem(id, shoppingListId, programNumber, price, quantity);
  }

  checkProductInList(productSKU, listId) {
    return new Promise(async (resolve, reject) => {
      try {
        let data = await this.databaseProvider.checkProductInList(productSKU, listId);
        resolve(data.rows.item(0) > 0);
      } catch (e) {
        reject(e);
      }
    });
  }

  removeShoppingList(listId) {
   return this.databaseProvider.removeShoppingList(listId);
  }
}
