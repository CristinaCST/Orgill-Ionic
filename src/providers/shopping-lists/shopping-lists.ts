import { Injectable } from '@angular/core';
import { DatabaseProvider } from '../database/database';
import { ShoppingListItem } from '../../interfaces/models/shopping-list-item';
import { DateTimeService } from '../../services/datetime/dateTime';
import { ApiService } from '../../services/api/api';
import * as ConstantsUrl from '../../util/constants-url';
import * as Constants from '../../util/constants';
import { LocalStorageHelper } from '../../helpers/local-storage';
import { Product } from '../../interfaces/models/product';
import { APIResponse } from '../../interfaces/response-body/response';
import { Observable } from 'rxjs';
import { DatabaseActionResponse } from '../../interfaces/response-body/database-action-response';
import { DatabaseOrder } from '../../interfaces/models/database-order';
import { ProductListInfo } from '../../interfaces/models/product-list-info';
import { OrderResult } from '../../interfaces/response-body/order-result';
import { Moment } from 'moment';
import { ShoppingListResponse } from '../../interfaces/response-body/shopping-list';
import { ProductListResponse } from '../../interfaces/response-body/product-list';
import { User } from '../../interfaces/models/user';


@Injectable()
export class ShoppingListsProvider {
  private readonly userToken: string ;

  constructor(private readonly databaseProvider: DatabaseProvider, private readonly apiProvider: ApiService) {
    const userInfo: User = JSON.parse(LocalStorageHelper.getFromLocalStorage(Constants.USER));
    if (userInfo) {
      this.userToken = userInfo.userToken;
    }
  }

  public getLocalShoppingLists(): Promise<any> {
    return this.databaseProvider.getAllShoppingLists();
  }

  public addItemToShoppingList(listId: number, shoppingListItem: ShoppingListItem, marketOnly: boolean): Observable<APIResponse> {
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

  public getShoppingListsForProduct(productSKU: string, programNumber: string): Observable<APIResponse> {
    // return this.databaseProvider.getShoppingListsForProduct(productSKU);
    return this.apiProvider.post(ConstantsUrl.CHECK_PRODUCT_SHOPPING_LISTS, {
      user_token: this.userToken,
      sku: productSKU,
      program_no: programNumber
    });
  }

  public createNewShoppingList(name: string, description: string = '', type: string = '0'): Observable<APIResponse> {
    // return this.databaseProvider.addShoppingList(name, description, type);
    return this.apiProvider.post(ConstantsUrl.ADD_SHOPPING_NEW_LIST, {
      user_token: this.userToken,
      list_name: name,
      list_description: description,
      list_type: type
    });
  }

  public createDefaultShoppingLists(): Observable<APIResponse> {
    return this.apiProvider.post(ConstantsUrl.CREATE_DEFAULT_LISTS, {
      user_token: this.userToken
    });
  }

  public removeShoppingList(listId: number): Observable<APIResponse> {
    // return this.databaseProvider.removeShoppingList(listId);
    return this.apiProvider.post(ConstantsUrl.DELETE_SHOPPING_LIST, {
      user_token: this.userToken,
      shopping_list_id: listId
    });
  }

  public getAllShoppingLists(): Observable<APIResponse> {
    return this.apiProvider.post(ConstantsUrl.GET_USER_SHOPPING_LISTS, { user_token: this.userToken });
  }

  public getAllProductsInShoppingList(listId: number): Promise<ShoppingListItem[]> {
    return new Promise((resolve, reject) => {
      this.apiProvider.post(ConstantsUrl.GET_SHOPPING_LIST_ITEMS, {
        user_token: this.userToken,
        shopping_list_id: listId
      }).subscribe((shoppingListItemsData: APIResponse) => {

        const itemsData: ProductListResponse[] = JSON.parse(shoppingListItemsData.d);
        this.getAllProductData(itemsData).then(allProductData => {
          resolve(allProductData);
        }, err => {
          reject(err);
        });

      });
    });
  }

  public getAllProductData(productList: ProductListResponse[]): Promise<ShoppingListItem[]> {
    return new Promise((resolve, reject) => {
      const list: ShoppingListItem[] = [];
      if (productList.length === 0) {
        reject('No products');
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
            YOURCOST: element.price,
            QTY_ROUND_OPTION: element.qty_round_option,
            SHELF_PACK: element.shelf_pack
          } as Product,
          program_number: element.program_no,
          item_price: typeof element.price === 'string' ? parseFloat(element.price) : element.price,
          quantity: typeof element.quantity === 'string' ? parseInt(element.quantity, 10) : element.quantity,
          isCheckedInShoppingList: false,
          isExpired: this.isExpiredProgram(element.end_date)
        };
        list.push(shoppingListProduct);

      });
      resolve(list);

    });
  }

  public checkNameAvailability(name: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.getAllShoppingLists()
        .subscribe(data => {
        const shoppingListsData: ShoppingListResponse[] = JSON.parse(data.d);
        let listFound: boolean = false;
        if (shoppingListsData.length > 0) {
          for (const shoppingListData of shoppingListsData) {
            if (shoppingListData.list_name === name) {
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
        reject);
      });
  }

  private isExpiredProgram(date: string): boolean {
    const now: Moment = DateTimeService.getCurrentDateTime();
    const endDate: Moment = DateTimeService.dateInMonthDayYearFormat(date);
    return now.isAfter(endDate);
  }

  /*
  public setProducts(data) {
    console.log("DATA IN SET PRODUCTS: ", data);
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
  }*/

  public deleteProductFromList(listId: number, productSku: string, programNo: string): Observable<APIResponse> {
    // return this.databaseProvider.removeProductsFromShoppingList(listId, productIdsArr);
    return this.apiProvider.post(ConstantsUrl.REMOVE_SHOPPING_LIST_ITEM,
      {
        user_token: this.userToken,
        shopping_list_id: listId,
        sku: productSku,
        program_no: programNo
      });
  }

  public insertPurchaseToDB(purchaseInfo: DatabaseOrder): Promise<DatabaseActionResponse> {
    return this.databaseProvider.insertPurchase(purchaseInfo);
  }

  public deleteItemsFromList(insertId: number, itemsIdsArr: number[], shoppingListId: number): Promise<DatabaseActionResponse> {
    return this.databaseProvider.finalizePurchase(insertId, itemsIdsArr, shoppingListId);
  }

  public orderProducts(productInfoList: ProductListInfo, insertToDBInfo: DatabaseOrder, itemsIdsArr: number[], shoppingListId: number): Promise<OrderResult> {
    return new Promise((resolve, reject) => {
        productInfoList.user_token = this.userToken;
        try {
          this.apiProvider.post(ConstantsUrl.URL_SHOPPING_LISTS_ORDER_PRODUCTS, productInfoList).subscribe((response: APIResponse) => {
            if (response) {
              insertToDBInfo.confirmation_number = JSON.parse(response.d);
              
              // TODO: Should change this to promise-like and get rid of await, of all awaits for that matter.
              let insertedPurchaseToDBInfo: DatabaseActionResponse;
              let removedItemsFromShoppingList: DatabaseActionResponse;
              this.insertPurchaseToDB(insertToDBInfo).then((insertedDataResponse: DatabaseActionResponse) => {
                insertedPurchaseToDBInfo = insertedDataResponse;
                return this.deleteItemsFromList(insertedPurchaseToDBInfo.insertId, itemsIdsArr, shoppingListId);
              }).then((removeItemsResponse: DatabaseActionResponse) => {
                removedItemsFromShoppingList = removeItemsResponse;
                resolve({
                  insertedPurchaseToDBInfo, confirmationNumber: insertToDBInfo.confirmation_number,
                  removedItemsFromShoppingList
                } as OrderResult);
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


  public getOrderConfirmation(confirmationNumbers: string): Observable<APIResponse> {
    const params: any = {
      user_token: this.userToken,
      confirmation_numbers: confirmationNumbers
    };
    return this.apiProvider.post(ConstantsUrl.URL_SHOPPING_LISTS_ORDER_CONFIRMATION, params);
  }

  public search(shoppingListItems: ShoppingListItem[], searchString: string): ShoppingListItem[] {
    const searchFn: (value: string) => boolean = (value: string) => {
      return value.toLocaleLowerCase().search(searchString.toLowerCase()) !== -1;
    };

    return shoppingListItems.filter(item => searchFn(item.product.NAME) || searchFn(item.product.SKU) || searchFn(item.product.UPC_CODE));
  }

  public updateShoppingListItem(product: Product, shoppingListId: number, programNumber: string, price: number, quantity: number): Observable<APIResponse> {
    // return this.databaseProvider.updateShoppingListItem(id, shoppingListId, programNumber, price, quantity);
    return this.apiProvider.post(ConstantsUrl.UPDATE_SHOPPING_LIST_ITEM, {
      user_token: this.userToken,
      shopping_list_id: shoppingListId,
      sku: product.SKU,
      program_no: programNumber ? programNumber : '',
      Quantity: quantity,
      Price: price
    });
  }

  public checkProductInList(productSKU: string, listId: number, programNo: string): Observable<APIResponse> {
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
