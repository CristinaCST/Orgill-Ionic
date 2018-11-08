import {Injectable} from '@angular/core';
import {DatabaseProvider} from "../database/database";
import {ShoppingListItem} from "../../interfaces/models/shopping-list-item";

@Injectable()
export class ShoppingListsProvider {
  constructor(private databaseProvider: DatabaseProvider) {
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

}
