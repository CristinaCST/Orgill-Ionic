import {Component, OnInit} from '@angular/core';
import {ShoppingList} from "../../interfaces/models/shopping-list";
import {NavParams} from "ionic-angular";
import * as Constants from "../../util/constants";
import {ShoppingListsProvider} from "../../providers/shopping-lists/shopping-lists";
import {ShoppingListItem} from "../../interfaces/models/shopping-list-item";
import {NavController} from 'ionic-angular';
import {PopoversProvider} from "../../providers/popovers/popovers";
import {CustomerLocationPage} from "../customer-location/customer-location";

@Component({
  selector: 'page-shopping-list',
  templateUrl: 'shopping-list.html',
})
export class ShoppingListPage implements OnInit {

  private shoppingList: ShoppingList;
  private selectedItems: Array<ShoppingListItem> = [];
  public shoppingListItems: Array<ShoppingListItem> = [];
  public isCustomList: boolean = false;
  public orderTotal: number = 0;
  public isCheckout: boolean = true;
  public isSelectAll: boolean = false;
  public nrOfSelectedItems: number = 0;


  constructor(public navParams: NavParams,
              private navCtrl: NavController,
              private shoppingListProvider: ShoppingListsProvider,
              private popoversProvider: PopoversProvider) {
  }

  ionViewWillEnter() {
    this.ngOnInit();
  }

  ngOnInit(): void {
    this.shoppingList = this.navParams.get('list');
    if (this.navParams.get('isCheckout') === false) {
      this.isCheckout = false;
    }

    this.isCustomList = !(this.shoppingList.id === Constants.DEFAULT_LIST_ID || this.shoppingList.id === Constants.MARKET_ONLY_LIST_ID);
    this.shoppingListProvider.getAllProductsInShoppingList(this.shoppingList.id).then((data: Array<ShoppingListItem>) => {
      if (data) {
        this.shoppingListItems = data;
      }
    });
  }

  delete() {
    let array = this.selectedItems.filter((item) => item != null);
    if (array) {
      let idList = array.map(item => item.id);
      this.shoppingListProvider.deleteProductFromList(this.shoppingList.id, idList).then(
        () => this.selectedItems.map((item, index) => {
          if (item !== null) {
            this.shoppingListItems.splice(index, 1);
          }
        })
      )
    }
  }

  checkout() {
    const params = {
      isCheckout: false,
      list: this.shoppingList
    };

    //TODO PUT A LOADING
    this.navCtrl.push(ShoppingListPage, params);
  }

  setOrderTotal(event, index) {
    switch (event.status) {
      case 'checkedItem':
        this.selectedItems[index] = this.shoppingListItems[index];
        this.nrOfSelectedItems += 1;
        this.orderTotal += event.price;
        break;
      case 'uncheckedItem':
        this.selectedItems[index] = null;
        this.nrOfSelectedItems -= 1;
        this.orderTotal -= event.price;
        break;
    }
  }

  onChecked($event, index) {
    this.setOrderTotal($event, index);
    this.isSelectAll = this.nrOfSelectedItems === this.shoppingListItems.length;
  }

  selectAll() {
    this.isSelectAll = !this.isSelectAll;
    this.orderTotal = 0;
    this.nrOfSelectedItems = 0;

    this.shoppingListItems.map((item, index) => {
      if (this.isSelectAll === true) {
        item.isCheckedInShoppingList = true;
        this.setOrderTotal({status: 'checkedItem', price: item.item_price}, index);
      } else {
        item.isCheckedInShoppingList = false;
        this.selectedItems = [];
      }
    });
    //console.log('%cItem', 'color:pink', item);
  }

  continue() {
    if (this.nrOfSelectedItems === 0) {
      let content = this.popoversProvider.setContent(Constants.SHOPPING_LIST_NO_ITEMS_TITLE, Constants.SHOPPING_LIST_NO_ITEMS_MESSAGE);
      this.popoversProvider.show(content);
    } else {
      let array = this.selectedItems.filter((item) => item != null);
      let params = {
        shoppingListId: this.shoppingList.id,
        shoppingListItems: array,
        orderTotal:this.orderTotal
      };
      this.navCtrl.push(CustomerLocationPage, params);
    }
  }


}
