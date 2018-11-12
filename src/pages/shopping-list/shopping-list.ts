import {Component, OnInit} from '@angular/core';
import {ShoppingList} from "../../interfaces/models/shopping-list";
import {NavParams} from "ionic-angular";
import * as Constants from "../../util/constants";
import {ShoppingListsProvider} from "../../providers/shopping-lists/shopping-lists";
import {ShoppingListItem} from "../../interfaces/models/shopping-list-item";

@Component({
  selector: 'page-shopping-list',
  templateUrl: 'shopping-list.html',
})
export class ShoppingListPage implements OnInit {

  private shoppingList: ShoppingList;
  public shoppingListItems: Array<ShoppingListItem> = [];
  public isCustomList: boolean = false;
  public allItemsSelected: boolean = false;
  public orderTotal: number = 0;

  constructor(public navParams: NavParams, private shoppingListProvider: ShoppingListsProvider) {
  }

  ngOnInit(): void {
    this.shoppingList = this.navParams.get('list');
    this.isCustomList = !(this.shoppingList.id === Constants.DEFAULT_LIST_ID || this.shoppingList.id === Constants.MARKET_ONLY_LIST_ID);
    this.shoppingListProvider.getAllProductsInShoppingList(this.shoppingList.id).then((data: Array<ShoppingListItem>) => {
      if (data) {
        this.shoppingListItems = data;
      }
    });
  }

  delete(){
  //   let IdsToDelete = [];
  //   this.shoppingListItems.forEach(item => {
  //     IdsToDelete.push(item.id);
  //   });
  //   this.shoppingListProvider.deleteProductFromList(this.shoppingList.id,IdsToDelete);
  }

  checkout() {
  }

  setOrderTotal(event) {
    switch (event.status) {
      case 'checkedItem':
        this.orderTotal += event.price;
        break;
      case 'uncheckedItem':
        this.orderTotal -= event.price;
        break;
    }
  }

  onChecked($event) {
    this.setOrderTotal($event);
  }
}
