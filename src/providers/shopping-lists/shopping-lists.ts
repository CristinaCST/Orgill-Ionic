import { Injectable } from '@angular/core';
import { DatabaseProvider } from '../database/database';
import { ShoppingListItem } from '../../interfaces/models/shopping-list-item';
import { dateTimeService } from '../../services/datetime/dateTime';
import { ApiService } from '../../services/api/api';
import * as ConstantsUrl from '../../util/constants-url';
import * as Constants from '../../util/constants';
import { LocalStorageHelper } from '../../helpers/local-storage';
import { Product } from 'interfaces/models/product';


@Injectable()
export class ShoppingListsProvider {
  private readonly userToken: string ;

  constructor(private databaseProvider: DatabaseProvider, private apiProvider: ApiService) {
    const userInfo = JSON.parse(LocalStorageHelper.getFromLocalStorage(Constants.USER));
    if (userInfo) {
      this.userToken = userInfo.userToken;
    }
  }

  public getLocalShoppingLists(): Promise<any> {
    return this.databaseProvider.getAllShoppingLists();
  }

  public addItemToShoppingList(listId: number, shoppingListItem: ShoppingListItem, marketOnly) {
    // return this.databaseProvider.addProductToShoppingList(listId, shoppingListItem);
    return this.apiProvider.post(ConstantsUrl.ADD_SHOPPING_LIST_ITEM, {
      user_token: this.userToken,
      shopping_list_id: listId,
      sku: shoppingListItem.product.SKU,
      program_no: shoppingListItem.program_number,
      Quantity: shoppingListItem.quantity,
      Price: shoppingListItem.item_price
    });
  }

  public getShoppingListsForProduct(productSKU: string, programNumber: string) {
    // return this.databaseProvider.getShoppingListsForProduct(productSKU);
    return this.apiProvider.post(ConstantsUrl.CHECK_PRODUCT_SHOPPING_LISTS, {
      user_token: this.userToken,
      sku: productSKU,
      program_no: programNumber
    });
  }

  public createNewShoppingList(name, description = '', type = '0') {
    // return this.databaseProvider.addShoppingList(name, description, type);
    return this.apiProvider.post(ConstantsUrl.ADD_SHOPPING_NEW_LIST, {
      user_token: this.userToken,
      list_name: name,
      list_description: description,
      list_type: type
    });
  }

  public createDefaultShoppingLists() {
    return this.apiProvider.post(ConstantsUrl.CREATE_DEFAULT_LISTS, {
      user_token: this.userToken
    });
  }

  public removeShoppingList(listId) {
    // return this.databaseProvider.removeShoppingList(listId);
    return this.apiProvider.post(ConstantsUrl.DELETE_SHOPPING_LIST, {
      user_token: this.userToken,
      shopping_list_id: listId
    });
  }

  public getAllShoppingLists() {
    return this.apiProvider.post(ConstantsUrl.GET_USER_SHOPPING_LISTS, { user_token: this.userToken });
  }

  public getAllProductsInShoppingList(listId) {
    return new Promise((resolve, reject) => {
      this.apiProvider.post(ConstantsUrl.GET_SHOPPING_LIST_ITEMS, {
        user_token: this.userToken,
        shopping_list_id: listId
      }).subscribe(shoppingListItemsData => {

        const itemsData = JSON.parse(shoppingListItemsData.d);
        this.getAllProductData(itemsData).then(allProductData => {
          resolve(allProductData);
        }, err => {
          reject(err);
        });

      });
    });
  }

  public getAllProductData(productList) {
    return new Promise((resolve, reject) => {
      const list = [];
      if (productList.length === 0) {
        return reject('No products');
      }
     /* productList.forEach( element => {

        reqs.push(this.apiProvider.post(ConstantsUrl.URL_PRODUCT_SEARCH,{
              "user_token" : this.userToken,
            //  "search_string" : "'" + element.sku + "'",
              "search_string" :element.sku,
              "category_id": "",
              "program_number": element.program_no,
              "p": "1",
              "rpp": resultsPerPage
            }));
      });*/
     // Observable.from(reqs).concatMap(shift => shift).subscribe( resp => {

       // let data: any;
       // data = JSON.parse(resp["d"])[0];
     //  data = JSON.parse(resp["d"]);

         // HACK: Big hack for missing API + fix
     //  let element = productList.filter(elem=> elem.sku == data.SKU)[0];

     /*   let dataIndex;
        data.forEach((elem,index)=>{
          productList.forEach((prod)=>{
            if(elem.SKU==prod.sku)
            {
              element = prod;
              dataIndex = index;
            }
          })
        })

        data = data[dataIndex];
*/
      productList.forEach(element => {
        if (!element) {
          return;
        }

        const shoppingListProduct: ShoppingListItem = {
          id: element.id,
          product: {
            SKU: element.sku,
            NAME: element.name,
            VENDOR_NAME: element.vendor_name,
            SELLING_UNIT: element.selling_unit,
            YOURCOST: element.price
          } as Product,
          program_number: element.program_no,
          item_price: element.price,
          quantity: element.quantity,
          isCheckedInShoppingList: false,
          isExpired: this.isExpiredProgram(element.end_date)
        };
        list.push(shoppingListProduct);

      });
      resolve(list);

    });
  }

  public checkNameAvailability(name): Promise<any> {
    return new Promise((resolve, reject) => {
      this.getAllShoppingLists()
        .subscribe(data => {
        const shoppingListsData = JSON.parse(data.d);
        let listFound = false;
        if (shoppingListsData.length > 0) {
          for (let i = 0; i < shoppingListsData.length; i++) {
            if (shoppingListsData[i].list_name === name) {
              listFound = true;
            }
          }
        }
        if (listFound) {
          resolve('unavailable');
        } else {
          resolve('available');
        }
      },
        error => reject(error));
      });
  }

  private isExpiredProgram(date) {
    const now = dateTimeService.getCurrentDateTime();
    const endDate = dateTimeService.dateInMonthDayYearFormat(date);
    return now.isAfter(endDate);
  }

  public setProducts(data) {
    const list = [];
    if (data.length > 0) {
      for (let i = 0; i < data.length; i++) {
        const item = data[i];
        const shoppingListProduct: ShoppingListItem = {
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
        list.push(shoppingListProduct);
      }
    }
    return list;
  }

  public deleteProductFromList(listId, productSku, programNo) {
    // return this.databaseProvider.removeProductsFromShoppingList(listId, productIdsArr);
    return this.apiProvider.post(ConstantsUrl.REMOVE_SHOPPING_LIST_ITEM,
      {
        user_token: this.userToken,
        shopping_list_id: listId,
        sku: productSku,
        program_no: programNo
      });
  }

  public insertPurchaseToDB(purchaseInfo) {
    return this.databaseProvider.insertPurchase(purchaseInfo);
  }

  public deleteItemsFromList(insertId, itemsIdsArr, shoppingListId) {
    return this.databaseProvider.finalizePurchase(insertId, itemsIdsArr, shoppingListId);
  }

  public orderProducts(productInfoList, insertToDBInfo, itemsIdsArr, shoppingListId) {
    return new Promise((resolve, reject) => {
        productInfoList.user_token = this.userToken;
        try {
          this.apiProvider.post(ConstantsUrl.URL_SHOPPING_LISTS_ORDER_PRODUCTS, productInfoList).subscribe(async response => {
            if (response) {
              insertToDBInfo.confirmation_number = JSON.parse(response.d);
              const insertedPurchaseToDBInfo = await this.insertPurchaseToDB(insertToDBInfo);
              const removedItemsFromShoppingList = await this.deleteItemsFromList(insertedPurchaseToDBInfo.insertId, itemsIdsArr, shoppingListId);
              resolve({
                insertedPurchaseToDBInfo, confirmationNumber: JSON.parse(response.d),
                removedItemsFromShoppingList
              });
            } else {
              reject(response);
            }
          });
        } catch (e) {
          reject(e);
        }
      }
    );
  }


  public getOrderConfirmation(confirmationNumbers) {
    const params = {
      'user_token': this.userToken,
      'confirmation_numbers': confirmationNumbers
    };
    return this.apiProvider.post(ConstantsUrl.URL_SHOPPING_LISTS_ORDER_CONFIRMATION, params);
  }

  public search(shoppingListItems: ShoppingListItem[], searchString) {
    const searchFn = value => value.toLocaleLowerCase().search(searchString.toLowerCase()) !== -1;
    return shoppingListItems.filter(item => searchFn(item.product.NAME) || searchFn(item.product.SKU) || searchFn(item.product.UPC_CODE));
  }

  public updateShoppingListItem(product: Product, shoppingListId: number, programNumber: string, price: number, quantity: number) {
    // return this.databaseProvider.updateShoppingListItem(id, shoppingListId, programNumber, price, quantity);
    return this.apiProvider.post(ConstantsUrl.UPDATE_SHOPPING_LIST_ITEM, {
      user_token: this.userToken,
      shopping_list_id: shoppingListId,
      sku: product.SKU,
      program_no: programNumber,
      Quantity: quantity,
      Price: price
    });
  }

  public checkProductInList(productSKU, listId, programNo) {
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
