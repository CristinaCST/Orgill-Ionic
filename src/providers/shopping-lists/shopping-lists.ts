import { Injectable } from '@angular/core';
import { ShoppingListItem } from '../../interfaces/models/shopping-list-item';
import { DateTimeService } from '../../services/datetime/dateTimeService';
import { ApiService } from '../../services/api/api';
import * as ConstantsUrl from '../../util/constants-url';
import * as Constants from '../../util/constants';
import { Product } from '../../interfaces/models/product';
import { APIResponse } from '../../interfaces/response-body/response';
import { Observable } from 'rxjs';
// import { DatabaseOrder } from '../../interfaces/models/database-order';
// import { ProductListInfo } from '../../interfaces/models/product-list-info';
import { OrderResult } from '../../interfaces/response-body/order-result';
import { Moment } from 'moment';
import { ShoppingListResponse } from '../../interfaces/response-body/shopping-list';
import { ProductListResponse } from '../../interfaces/response-body/product-list';
import { Events } from 'ionic-angular/util/events';

export enum ListType {
  CustomRegular = 0,
  DefaultRegular = 1,
  DefaultMarketOnly = 2,
  CustomMarketOnly = 3
}

@Injectable()
export class ShoppingListsProvider {
  constructor(private readonly apiProvider: ApiService, private readonly events: Events) {}

  public addItemToShoppingList(
    listId: number,
    shoppingListItem: ShoppingListItem,
    marketOnly: boolean
  ): Observable<APIResponse> {
    return this.apiProvider.post(
      ConstantsUrl.ADD_SHOPPING_LIST_ITEM,
      {
        shopping_list_id: listId,
        sku: shoppingListItem.product.sku,
        program_no: shoppingListItem.program_number || '0',
        quantity: shoppingListItem.quantity,
        price: shoppingListItem.item_price
      },
      true
    );
  }

  public getShoppingListsForProduct(productSKU: string, programNumber?: string): Observable<APIResponse> {
    return this.apiProvider.get(`${ConstantsUrl.CHECK_PRODUCT_SHOPPING_LISTS}/${productSKU}`);
  }

  public createNewShoppingList(
    name: string,
    description: string = '',
    type: string | number = '0'
  ): Observable<APIResponse> {
    return this.apiProvider
      .post(
        ConstantsUrl.ADD_SHOPPING_NEW_LIST,
        {
          list_name: name,
          list_description: description,
          list_type: type
        },
        true
      )
      .map(res => {
        this.events.publish(Constants.EVENT_NEW_SHOPPING_LIST);
        return res;
      });
  }

  public createDefaultShoppingLists(): Observable<APIResponse> {
    return this.apiProvider.post(ConstantsUrl.CREATE_DEFAULT_LISTS, {}, true);
  }

  public removeShoppingList(listId: number): Observable<APIResponse> {
    return this.apiProvider.delete(`${ConstantsUrl.DELETE_SHOPPING_LIST}/${listId}`);
  }

  public getAllShoppingLists(): Observable<APIResponse> {
    return this.apiProvider.get(ConstantsUrl.GET_USER_SHOPPING_LISTS);
  }

  public getAllProductsInShoppingList(listId: number): Promise<ShoppingListItem[]> {
    return new Promise((resolve, reject) => {
      this.apiProvider.get(`${ConstantsUrl.GET_SHOPPING_LIST_ITEMS}/${listId}`).subscribe(
        (shoppingListItemsData: any) => {
          const itemsData: ProductListResponse[] = shoppingListItemsData;
          this.getAllProductData(itemsData).then(
            allProductData => {
              resolve(allProductData);
            },
            err => {
              reject(err);
            }
          );
        },
        err => {
          reject(err);
        }
      );
    });
  }

  public getAllProductData(productList: ProductListResponse[]): Promise<ShoppingListItem[]> {
    return new Promise(resolve => {
      const list: ShoppingListItem[] = [];

      productList.forEach(element => {
        if (!element) {
          return;
        }

        const shoppingListProduct: ShoppingListItem = {
          id: element.id,
          product: {
            sku: element.sku,
            name: element.name,
            vendoR_NAME: element.vendor_name,
            sellinG_UNIT: element.selling_unit,
            yourcost: element.price,
            qtY_ROUND_OPTION: element.qty_round_option,
            shelF_PACK: element.shelf_pack
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
      this.getAllShoppingLists().subscribe((data: any) => {
        const shoppingListsData: ShoppingListResponse[] = data;
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
      }, reject);
    });
  }

  private isExpiredProgram(date: string): boolean {
    const now: Moment = DateTimeService.getCurrentDateTime();
    const endDate: Moment = DateTimeService.dateInMonthDayYearFormat(date);
    return now.isAfter(endDate);
  }

  public deleteProductFromList(listId: number, productSku: string, programNo: string): Observable<APIResponse> {
    return this.apiProvider.delete(ConstantsUrl.REMOVE_SHOPPING_LIST_ITEM, {
      shopping_list_id: listId,
      sku: productSku,
      program_number: programNo
    });
  }

  public orderProducts(data: any): Promise<OrderResult> {
    return new Promise((resolve, reject) => {
      try {
        this.apiProvider.post(ConstantsUrl.URL_SHOPPING_LISTS_ORDER_PRODUCTS, data, true).subscribe((response: any) => {
          if (response > 0) {
            resolve({ confirmationNumber: response } as OrderResult);
          } else {
            reject(response);
          }
        });
      } catch (e) {
        reject(e);
      }
    });
  }

  public getOrderConfirmation(confirmationNumbers: string): Observable<APIResponse> {
    const params: any = {
      confirmation_numbers: confirmationNumbers
    };
    return this.apiProvider.get(ConstantsUrl.URL_SHOPPING_LISTS_ORDER_CONFIRMATION, params);
  }

  public search(shoppingListItems: ShoppingListItem[], searchString: string): ShoppingListItem[] {
    const searchFn: (value: any) => boolean = (value: any) => {
      if (!value) {
        return false;
      }
      return value.toLocaleLowerCase().search(searchString.toLowerCase()) !== -1;
    };

    return shoppingListItems.filter(
      item => searchFn(item.product.name) || searchFn(item.product.sku) || searchFn(item.product.upC_CODE)
    );
  }

  public updateShoppingListItem(
    product: Product,
    shoppingListId: number,
    programNumber: string,
    price: number,
    quantity: number
  ): Observable<APIResponse> {
    return this.apiProvider.put(ConstantsUrl.UPDATE_SHOPPING_LIST_ITEM, {
      shopping_list_id: shoppingListId,
      sku: product.sku,
      program_no: programNumber,
      quantity: quantity,
      price: price
    });
  }

  public checkProductInList(productSKU: string, listId: number, programNo: string): Observable<boolean> {
    return this.apiProvider.get(ConstantsUrl.CHECK_PRODUCT_SHOPPING_LIST, {
      sku: productSKU,
      shopping_list_id: listId,
      program_number: programNo
    });
  }
}
