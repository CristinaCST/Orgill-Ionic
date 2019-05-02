import {Component, ViewChild} from '@angular/core';
import {ShoppingList} from "../../interfaces/models/shopping-list";
import {Content, Events, NavParams} from "ionic-angular";
import * as Constants from "../../util/constants";
import {ShoppingListsProvider} from "../../providers/shopping-lists/shopping-lists";
import {ShoppingListItem} from "../../interfaces/models/shopping-list-item";
import {NavController} from 'ionic-angular';
import {PopoversProvider} from "../../providers/popovers/popovers";
import {CustomerLocationPage} from "../customer-location/customer-location";
import {ProductPage} from "../product/product";
import {TranslateProvider} from "../../providers/translate/translate";
import {ScannerPage} from "../scanner/scanner";

@Component({
  selector: 'page-shopping-list',
  templateUrl: 'shopping-list.html',
})
export class ShoppingListPage {
  @ViewChild(Content) content: Content;

  private shoppingList: ShoppingList;
  private selectedItems: Array<ShoppingListItem> = [];
  public shoppingListItems: Array<ShoppingListItem> = [];
  public isCustomList: boolean = false;
  public orderTotal: number = 0;
  public isCheckout: boolean = true;
  public isSelectAll: boolean = false;
  public nrOfSelectedItems: number = 0;
  public menuCustomButtons = [];

  constructor(public navParams: NavParams,
              private navCtrl: NavController,
              private shoppingListProvider: ShoppingListsProvider,
              private popoversProvider: PopoversProvider,
              private translator: TranslateProvider,
              private events: Events) {
    this.menuCustomButtons = [{action: 'detailsList', icon: 'information-circle'},
      {action: 'scan', icon: 'barcode'}];
  }

  ionViewWillEnter() {
    this.init();
  }

  init(): void {
    this.shoppingList = this.navParams.get('list');
    if (this.navParams.get('isCheckout') !== undefined) {
      this.isCheckout = this.navParams.get('isCheckout');
    }
    if (this.navParams.get('shoppingListItems')) {
      this.shoppingListItems = this.navParams.get('shoppingListItems');
      this.content.resize();
    }
    else {
      this.isCustomList = !(this.shoppingList.id !== Constants.DEFAULT_LIST_ID && this.shoppingList.id !== Constants.MARKET_ONLY_LIST_ID);
      if (!this.isCustomList) {
        this.menuCustomButtons.push({
          action: 'deleteList',
          icon: 'trash'
        });
      }
      this.shoppingListProvider.getAllProductsInShoppingList(this.shoppingList.id).then((data: Array<ShoppingListItem>) => {
        if (data) {
          this.shoppingListItems = data;
          this.checkExpiredItems();
          this.content.resize();
        }
      }).catch(error => console.error(error));
    }
  }

  checkExpiredItems() {
    let isExpired = this.shoppingListItems.filter(item => item.isExpired).length > 0;
    if (isExpired) {
      let content = this.popoversProvider.setContent(Constants.POPOVER_EXPIRED_ITEMS_TITLE, Constants.POPOVER_EXPIRED_ITEMS_MESSAGE);
      this.popoversProvider.show(content);
    }
  }

  delete() {
    let array = this.selectedItems.filter((item) => item != null);
    if (array) {
      let idItem = array.map(item => item.id);
      this.shoppingListProvider.deleteProductFromList(this.shoppingList.id, idItem).then(
        () => this.selectedItems.map((item, index) => {
          if (item !== null) {
            let price = (item.item_price * item.quantity).toFixed(Constants.DECIMAL_NUMBER);
            this.setOrderTotal({status: 'uncheckedItem', price: price}, index);
            this.shoppingListItems.splice(index, 1);
          }
        })
      );
    }
  }

  checkout() {
    const params = {
      isCheckout: false,
      list: this.shoppingList
    };
    this.navCtrl.push(ShoppingListPage, params).catch(err => console.error(err));
  }

  setOrderTotal(event, index) {
    switch (event.status) {
      case 'checkedItem':
        this.selectedItems[index] = this.shoppingListItems[index];
        this.nrOfSelectedItems += 1;
        this.orderTotal += parseFloat(event.price);
        break;
      case 'uncheckedItem':
        this.selectedItems[index] = null;
        this.nrOfSelectedItems -= 1;
        this.orderTotal -= parseFloat(event.price);
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
        this.setOrderTotal({status: 'checkedItem', price: item.quantity * item.item_price}, index);
      } else {
        item.isCheckedInShoppingList = false;
        this.selectedItems = [];
      }
    });
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
        orderTotal: this.orderTotal
      };
      this.navCtrl.push(CustomerLocationPage, params).catch(err => console.error(err))
    }
  }

  onSearched($event) {
    let params = {
      list: this.shoppingList,
      shoppingListItems: this.shoppingListProvider.search(this.shoppingListItems, $event),
      isCheckout: this.isCheckout
    };
    this.navCtrl.push(ShoppingListPage, params).catch(err => console.error(err));
  }

  onCheckedToDetails($event) {
    this.navCtrl.push(ProductPage, {
      product: $event.product,
      programNumber: $event.program_number,
      fromShoppingList: true,
      shoppingListId: this.shoppingList.id,
      id: $event.id,
      quantity: $event.quantity
    }).catch(err => console.error(err))
  }

  buttonClicked($event) {
    switch ($event.type) {
      case 'detailsList':
        this.getListDetails();
        break;
      case 'deleteList':
        this.removeList();
        break;
      case 'scan':
        this.goToScanPage();
        break;
    }
  }

  goToScanPage() {
    this.navCtrl.push(ScannerPage, {
      'type': 'scan_barcode_tab',
      shoppingListId: this.shoppingList.id
    }).catch(err => console.error(err));
  }

  getListDetails() {
    let message = "";
    if (this.isCustomList) {
      message = this.translator.translate(Constants.SHOPPING_LIST_CUSTOM_DESCRIPTION);
    }
    let content = this.popoversProvider.setContent(this.shoppingList.name, message + this.shoppingList.description);
    this.popoversProvider.show(content);
  }

  removeList() {
    let content = this.popoversProvider.setContent(Constants.SHOPPING_LIST_DELETE_CONF_TITLE, Constants.SHOPPING_LIST_DELETE_CONF_MESSAGE,
      Constants.OK, Constants.CANCEL, Constants.POPOVER_DELETE_LIST_CONFIRMATION);
    this.popoversProvider.show(content).subscribe(data => {
      if (data.optionSelected === "OK") {
        this.shoppingListProvider.removeShoppingList(this.shoppingList.id).then(data => {
          console.log(data);
          this.events.publish('DeletedList', this.shoppingList.id);
          this.navCtrl.pop().catch(err => console.error(err));
        }).catch(err => console.error(err));
      }
    });
  }
}
