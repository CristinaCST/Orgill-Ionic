import {Component, ViewChild} from '@angular/core';
import {ShoppingList} from "../../interfaces/models/shopping-list";
import {Content, Events, NavParams, NavOptions} from "ionic-angular";
import * as Constants from "../../util/constants";
import * as Strings from "../../util/strings";
import {ShoppingListsProvider} from "../../providers/shopping-lists/shopping-lists";
import {ShoppingListItem} from "../../interfaces/models/shopping-list-item";
import {PopoversService} from "../../services/popovers/popovers";
import {CustomerLocationPage} from "../customer-location/customer-location";
import {ProductPage} from "../product/product";
import {TranslateWrapperService} from "../../services/translate/translate";
import {ScannerPage} from "../scanner/scanner";
import {LoadingService} from "../../services/loading/loading";
import { NavigatorService } from '../../services/navigator/navigator';
import { ScannerService } from '../../services/scanner/scanner';

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
  public isCheckout: boolean = false;
  private isDeleteMode: boolean = false;
  public isSelectAll: boolean = false;
  public nrOfSelectedItems: number = 0;
  public menuCustomButtons = [];
  private alreadyLoading: boolean = false;
  private loader: LoadingService;
  private holdTimeoutReference;

  constructor(public navParams: NavParams,
              private navigatorService: NavigatorService,
              private shoppingListProvider: ShoppingListsProvider,
              private popoversProvider: PopoversService,
              private translator: TranslateWrapperService,
              private events: Events,
              private loading: LoadingService,
              private scannerService: ScannerService) {
    
  

    this.loader = loading.createLoader();
    this.menuCustomButtons = [{ action: 'detailsList', icon: 'information-circle' },
    { action: 'scan', icon: 'barcode' }];
  }


  ionViewWillLeave() {
    this.events.unsubscribe("scannedProductAdded");
  }

  ionViewWillEnter() {
    this.events.subscribe("scannedProductAdded", () => {
      this.fillList();
    })

    if (!this.navParams.get('fromSearch')) { this.init(); }
    else {
      this.fillList();
    }
  }

  init(): void {
    this.alreadyLoading = true
    this.loader.show();
    
    this.fillList().then(()=>{
      this.loader.hide();
      this.alreadyLoading = false;
    },()=>{
      this.loader.hide();
      this.alreadyLoading = false;
    }).catch(()=>{
      this.loader.hide();
      this.alreadyLoading = false;
    });
  }

  fillList(){
    this.shoppingList = this.navParams.get('list');
    if (this.navParams.get('isCheckout') !== undefined) {
      this.isCheckout = this.navParams.get('isCheckout');
    }
    if (this.navParams.get('shoppingListItems')) {
      this.shoppingListItems = this.navParams.get('shoppingListItems');
      this.content.resize();
    }
    else {
      this.shoppingListItems = [];
      this.content.resize();
      
      this.isCustomList = !(this.shoppingList.ListType !== Constants.DEFAULT_LIST_TYPE && this.shoppingList.ListType !== Constants.MARKET_ONLY_LIST_TYPE);
      if (!this.isCustomList) {
        if(this.menuCustomButtons.map(function(d) { return d['action']; }).indexOf('deleteList') == -1) {
          this.menuCustomButtons.push({
            action: 'deleteList',
            icon: 'trash'
          });
        }
      }
      return this.shoppingListProvider.getAllProductsInShoppingList(this.shoppingList.ListID).then((data: Array<ShoppingListItem>) => {

        if (data) {
          this.shoppingListItems = data;
          this.checkExpiredItems();
          this.content.resize();
          return Promise.resolve();
        }
        else{
          return Promise.reject("Empty");
        }
      },(err)=>{
        console.error(err);
        LoadingService.hideAll();
      }).catch(error => {console.error(error);this.loader.hide();});
    }
  }

  checkExpiredItems() {
    let isExpired = this.shoppingListItems.filter(item => item.isExpired).length > 0;
    if (isExpired) {
      let content = this.popoversProvider.setContent(Strings.POPOVER_EXPIRED_ITEMS_TITLE, Strings.POPOVER_EXPIRED_ITEMS_MESSAGE);
      this.popoversProvider.show(content);
    }
  }

  delete() {
    let array = this.selectedItems.filter((item) => item != null);
    let bool = true;
    if (array) {
      let $this = this;
      array.forEach((elem) => {
          $this.shoppingListProvider.deleteProductFromList($this.shoppingList.ListID, elem.product.SKU, elem.program_number).subscribe(
            data => {},
            error => {
              bool = false;
              console.error(error);
            }
          )
        })
        if (bool) {
          $this.selectedItems.map((item, index) => {
            if (item !== null) {
              let price = (item.item_price * item.quantity).toFixed(Constants.DECIMAL_NUMBER);
              $this.setOrderTotal({status: 'uncheckedItem', price: price}, index);
              $this.shoppingListItems = $this.shoppingListItems.filter( elem => elem.product.SKU != item.product.SKU);
            }
          })
        }
      }
    }

  checkout() {
    const params = {
      isCheckout: true,
      list: this.shoppingList,
      paramsEquality: false
    };
    this.navigatorService.push(ShoppingListPage, params).catch(err => console.error(err));
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
      let content = this.popoversProvider.setContent(Strings.SHOPPING_LIST_NO_ITEMS_TITLE, Strings.SHOPPING_LIST_NO_ITEMS_MESSAGE);
      this.popoversProvider.show(content);
    } else {
      let array = this.selectedItems.filter((item) => item != null);
      let params = {
        shoppingListId: this.shoppingList.ListID,
        shoppingListItems: array,
        orderTotal: this.orderTotal
      };
      this.navigatorService.push(CustomerLocationPage, params).catch(err => console.error(err))
    }
  }

  onSearched($event) {

    this.shoppingListProvider.getAllProductsInShoppingList(this.shoppingList.ListID).then((data: Array<ShoppingListItem>) => {
     let params = {
      list: this.shoppingList,
      shoppingListItems: this.shoppingListProvider.search(data, $event),
      isCheckout: this.isCheckout,
      fromSearch: true
    };

    this.navigatorService.push(ShoppingListPage, params,{paramsEquality: this.navParams.get('fromSearch')? false:true} as NavOptions).catch(err => console.error(err));
  });
  }

  onCheckedToDetails($event) {
    this.navigatorService.push(ProductPage, {
      product: $event.product,
      programNumber: $event.program_number,
      fromShoppingList: true,
      shoppingListId: this.shoppingList.ListID,
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
        this.scan();
        break;
    }
  }

  goToScanPage() {
    /*this.navigatorService.push(ScannerPage, {
      'type': 'scan_barcode_tab',
      shoppingList: this.shoppingList
    }).catch(err => console.error(err));*/
  }

  private scan(){
  
    this.scannerService.scan(this.shoppingList,this.shoppingListItems);
  }

  getListDetails() {
    let message = "";
    if (this.isCustomList) {
      message = this.translator.translate(Strings.SHOPPING_LIST_CUSTOM_DESCRIPTION);
    }
    let content = this.popoversProvider.setContent(this.shoppingList.ListName, message + this.shoppingList.ListDescription);
    this.popoversProvider.show(content);
  }

  removeList() {
    let content = this.popoversProvider.setContent(Strings.SHOPPING_LIST_DELETE_CONF_TITLE, Strings.SHOPPING_LIST_DELETE_CONF_MESSAGE,
      Strings.MODAL_BUTTON_YES, Strings.MODAL_BUTTON_CANCEL, undefined, Constants.POPOVER_DELETE_LIST_CONFIRMATION);

    this.popoversProvider.show(content).subscribe(data => {
      if (data.optionSelected === "OK") {
        this.shoppingListProvider.removeShoppingList(this.shoppingList.ListID).subscribe(data => {
          this.events.publish('DeletedList', this.shoppingList.ListID);
          this.navigatorService.pop().catch(err => console.error(err));
        });
      }
    });
  }

  doRefresh($event){
    this.fillList().then(()=>{
      $event.complete();
    }).catch(()=>{
      $event.complete();
    });
  }

  refreshPulling($event){
    this.touchend();
  }

  touchstart(){
    this.holdTimeoutReference = setTimeout(()=>{
      this.isDeleteMode = true;
      this.navigatorService.oneTimeBackButtonOverride(()=>{
        this.isDeleteMode = false;
      });
    },600)

  }

  touchend(){
    clearTimeout(this.holdTimeoutReference);
  }

  scrollStart(){
    this.touchend();
  }

  scrollEnd(){
   // this.isScrolling = false;
  }
}
