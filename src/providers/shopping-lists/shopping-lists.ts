import {Injectable} from '@angular/core';
import {DatabaseProvider} from "../database/database";
import {ShoppingListItem} from "../../interfaces/models/shopping-list-item";
import {dateTimeProvider} from "../datetime/dateTime";
import {ApiProvider} from "../api/api";
import * as ConstantsUrl from "../../util/constants-url";
import * as Constants from "../../util/constants";

import {forkJoin} from "rxjs/observable/forkJoin";
import {Observable} from "rxjs/Observable";
import {concatMap} from "rxjs/operator/concatMap";
import {LocalStorageHelper} from "../../helpers/local-storage";
import { Product } from 'interfaces/models/product';


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

  addItemToShoppingList(listId: number, shoppingListItem: ShoppingListItem, marketOnly) {
    //return this.databaseProvider.addProductToShoppingList(listId, shoppingListItem);
    return this.apiProvider.post(ConstantsUrl.ADD_SHOPPING_LIST_ITEM, {
      user_token: this.userToken,
      shopping_list_id: listId,
      sku: shoppingListItem.product.SKU,
      program_no: shoppingListItem.program_number,
      Quantity: shoppingListItem.quantity,
      Price: shoppingListItem.item_price
    });
  }

  getShoppingListsForProduct(productSKU: string, programNumber:  string) {
    // return this.databaseProvider.getShoppingListsForProduct(productSKU);
    return this.apiProvider.post(ConstantsUrl.CHECK_PRODUCT_SHOPPING_LISTS, {
      user_token: this.userToken,
      sku: productSKU,
      program_no: programNumber
    });
  }

  createNewShoppingList(name, description = '', type = '0') {
    //return this.databaseProvider.addShoppingList(name, description, type);
    return this.apiProvider.post(ConstantsUrl.ADD_SHOPPING_NEW_LIST, {
      user_token: this.userToken,
      list_name: name,
      list_description: description,
      list_type: type
    });
  }

  createDefaultShoppingLists(){
    return this.apiProvider.post(ConstantsUrl.CREATE_DEFAULT_LISTS, {
      user_token: this.userToken
    });
  }

  removeShoppingList(listId) {
    //return this.databaseProvider.removeShoppingList(listId);
    return this.apiProvider.post(ConstantsUrl.DELETE_SHOPPING_LIST, {
      user_token: this.userToken,
      shopping_list_id: listId
    });
  }

  getAllShoppingLists() {
    return this.apiProvider.post(ConstantsUrl.GET_USER_SHOPPING_LISTS, {user_token: this.userToken});
  }

  getAllProductsInShoppingList(listId) {
    return new Promise((resolve, reject) => {
      this.apiProvider.post(ConstantsUrl.GET_SHOPPING_LIST_ITEMS, {
        user_token: this.userToken,
        shopping_list_id: listId
      }).subscribe(data => {
        let itemsData = JSON.parse(data.d);
        this.getAllProductData(itemsData).then(data => {
          resolve(data);
        },(err)=>{
          reject(err);
        })

      });
    });
  }

  getAllProductData(productList){
    return new Promise((resolve,reject) =>{
      let list = [];
      let reqs = [];
      if(productList.length==0)
      {
        return reject("No products");
      }
      productList.forEach( element => {
       
        reqs.push(this.apiProvider.post(ConstantsUrl.URL_PRODUCT_SEARCH,{
              "user_token" : this.userToken,
              "search_string" : element.sku,
              "category_id": "",
              "program_number": element.program_no,
              "p": "1",
              "rpp": "10"
            }));
      });
      Observable.from(reqs).concatMap(shift => shift).subscribe( resp => {
        
        let data: any;
        data = JSON.parse(resp["d"]);    

         //HACK: Big hack for missing API + fix
        let element;
        let dataIndex;
        data.forEach((elem,index)=>{
          productList.forEach((prod)=>{
            if(elem.SKU==prod.sku)
            {
              element = prod;
              dataIndex = index;
            //  console.log("FOUND ELEMENT",prod);
            }
          })
        })
        data = data[dataIndex];

      //  let element = productList.filter(elem => elem.sku == data.SKU)[0];

        let shoppingListProduct: ShoppingListItem = {
          id: element.id,
          product: {
            CatID: data.CatID,
            SKU: data.SKU,
            QTY_ROUND_OPTION: data.QTY_ROUND_OPTION,
            MODEL: data.MODEL,
            NAME: data.NAME,
            VENDOR_NAME: data.VENDOR_NAME,
            SELLING_UNIT: data.SELLING_UNIT,
            UPC_CODE: data.UPC_CODE,
            SUGGESTED_RETAIL: data.SUGGESTED_RETAIL,
            YOURCOST: data.YOURCOST,
            IMAGE: data.IMAGE,
            SHELF_PACK: data.SHELF_PACK,
            VELOCITY_CODE: data.VELOCITY_CODE,
            TOTAL_REC_COUNT: data.TOTAL_REC_COUNT
          },
          program_number: element.program_no,
          item_price: element.price,
          quantity: element.quantity,
          isCheckedInShoppingList: false,
          isExpired: this.isExpiredProgram(element.end_date)
        };
        list.push(shoppingListProduct);
        
      }).add(()=>{resolve(list);});
      
    });
  }

  checkNameAvailability(name): Promise<any> {
    return new Promise((resolve, reject) => {
      this.getAllShoppingLists()
        .subscribe(data => {
        var shoppingListsData = JSON.parse(data.d);
        var listFound = false;
        if (shoppingListsData.length > 0) {
          for (var i = 0; i < shoppingListsData.length; i++) {
            if (shoppingListsData[i].list_name == name) {
              listFound = true;
            }
          }
        }
        if (listFound) {
          resolve('unavailable');
        }
        else {
          resolve('available');
        }
      },
        error => reject(error))
      })
  }

  private isExpiredProgram(date) {
    const now = dateTimeProvider.getCurrentDateTime();
    const endDate = dateTimeProvider.dateInMonthDayYearFormat(date);
    return now.isAfter(endDate);
  }

  private setProducts(data) {
    let list = [];
    if (data.length > 0) {
      for (let i = 0; i < data.length; i++) {
        let item = data[i];
        let shoppingListProduct: ShoppingListItem = {
          id: item.id,
          product: {
            CatID: item.CatID,
            SKU: item.SKU,
            QTY_ROUND_OPTION: item.QTY_ROUND_OPTION,
            MODEL: item.MODEL,
            NAME: item.NAME,
            VENDOR_NAME: item.VENDOR_NAME,
            SELLING_UNIT: item.SELLING_UNIT,
            UPC_CODE: item.UPC_CODE,
            SUGGESTED_RETAIL: item.SUGGESTED_RETAIL,
            YOURCOST: item.YOURCOST,
            IMAGE: item.IMAGE,
            SHELF_PACK: item.SHELF_PACK,
            VELOCITY_CODE: item.VELOCITY_CODE,
            TOTAL_REC_COUNT: item.TOTAL_REC_COUNT
          },
          program_number: item.program_no,
          item_price: item.price,
          quantity: item.quantity,
          isCheckedInShoppingList: false,
          isExpired: this.isExpiredProgram(item.end_date)
        };
        list.push(shoppingListProduct)
      }
    }
    return list;
  }

  deleteProductFromList(listId, productSku, programNo) {
    //return this.databaseProvider.removeProductsFromShoppingList(listId, productIdsArr);
    return this.apiProvider.post(ConstantsUrl.REMOVE_SHOPPING_LIST_ITEM,
      {
        user_token: this.userToken,
        shopping_list_id: listId,
        sku: productSku,
        program_no: programNo
      })
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

  search(shoppingListItems: Array<ShoppingListItem>, searchString) {
    let searchFn = (value) => value.toLocaleLowerCase().search(searchString.toLowerCase()) !== -1;
    return shoppingListItems.filter(item => searchFn(item.product.NAME) || searchFn(item.product.SKU) || searchFn(item.product.UPC_CODE));
  }

  updateShoppingListItem(product: Product, shoppingListId: number, programNumber: string, price: number, quantity: number) {
    //return this.databaseProvider.updateShoppingListItem(id, shoppingListId, programNumber, price, quantity);
    return this.apiProvider.post(ConstantsUrl.UPDATE_SHOPPING_LIST_ITEM, {
      user_token: this.userToken,
      shopping_list_id: shoppingListId,
      sku: product.SKU,
      program_no: programNumber,
      Quantity: quantity,
      Price: price
    })
  }

   checkProductInList(productSKU, listId, programNo) {
    // return new Promise(async (resolve, reject) => {
    //   try {
    //     let data = await this.databaseProvider.checkProductInList(productSKU, listId);
    //     resolve(data.rows.item(0).is_item_in_list > 0);
    //   } catch (e) {
    //     reject(e);
    //   }
    // });
    return this.apiProvider.post(ConstantsUrl.CHECK_PRODUCT_SHOPPING_LIST, {
      user_token: this.userToken,
      sku: productSKU,
      shopping_list_id: listId,
      program_no: programNo
    });
  }

}
