import { Component, ViewChild } from '@angular/core';
import { Content, Events, NavParams, NavOptions } from 'ionic-angular';

import { ShoppingList } from '../../interfaces/models/shopping-list';
import * as Constants from '../../util/constants';
import * as Strings from '../../util/strings';
import { ShoppingListsProvider } from '../../providers/shopping-lists/shopping-lists';
import { ShoppingListItem } from '../../interfaces/models/shopping-list-item';
import { PopoversService, DefaultPopoverResult, PopoverContent } from '../../services/popovers/popovers';
import { CustomerLocationPage } from '../customer-location/customer-location';
import { ProductPage } from '../product/product';
import { TranslateWrapperService } from '../../services/translate/translate';
import { LoadingService } from '../../services/loading/loading';
import { NavigatorService } from '../../services/navigator/navigator';
import { ScannerService } from '../../services/scanner/scanner';
import { Product } from '../../interfaces/models/product';
import { getNavParam } from '../../util/validatedNavParams';

@Component({
  selector: 'page-shopping-list',
  templateUrl: 'shopping-list.html'
})
export class ShoppingListPage {
  @ViewChild(Content) private readonly content: Content;

  public isDeleteMode: boolean = false;
  private shoppingList: ShoppingList;
  private selectedItems: ShoppingListItem[] = [];
  private shoppingListItems: ShoppingListItem[] = [];
  private isCustomList: boolean = false;
  private orderTotal: number = 0;
  private isCheckout: boolean = false;
  private isSelectAll: boolean = false;
  private nrOfSelectedItems: number = 0;
  private readonly menuCustomButtons: any[] = [];
  private readonly loader: LoadingService;
  private holdTimeoutReference: number;

  constructor(
    private readonly navParams: NavParams,
    private readonly navigatorService: NavigatorService,
    private readonly shoppingListProvider: ShoppingListsProvider,
    private readonly popoversProvider: PopoversService,
    private readonly translator: TranslateWrapperService,
    private readonly events: Events,
    private readonly loading: LoadingService,
    private readonly scannerService: ScannerService) {

    this.loader = this.loading.createLoader();
    this.menuCustomButtons = [{ action: 'detailsList', icon: 'information-circle' }, { action: 'scan', icon: 'barcode' }];
  }


  public ionViewWillLeave(): void {
    this.events.unsubscribe('scannedProductAdded');
  }

  public ionViewWillEnter(): void {
    // this.fillList();
    this.events.subscribe('scannedProductAdded', () => {
      this.fillList();
    });

    if (!getNavParam(this.navParams, 'fromSearch', 'boolean')) {
      this.init();
    } else {
      this.fillList();
    }
  }

  private init(): void {
    this.loader.show();

    this.fillList().then(() => {
      this.loader.hide();
    }, () => {
      this.loader.hide();
    }).catch(() => {
      this.loader.hide();
    });
  }

  private fillList(): Promise<void> {
    this.shoppingList = getNavParam(this.navParams, 'list', 'object');
    this.isCheckout = getNavParam(this.navParams, 'isCheckout', 'boolean');

    this.shoppingListItems = getNavParam(this.navParams, 'shoppingListItems', 'object');
    if (!this.shoppingListItems) {
      this.shoppingListItems = [];
    }
    this.content.resize();

    this.isCustomList = !(this.shoppingList.ListType !== Constants.DEFAULT_LIST_TYPE && this.shoppingList.ListType !== Constants.MARKET_ONLY_LIST_TYPE);
    if (!this.isCustomList) {
      if (this.menuCustomButtons.map(d => d.action).indexOf('deleteList') === -1) {
        this.menuCustomButtons.push({
          action: 'deleteList',
          icon: 'trash'
        });
      }
    }
    return this.shoppingListProvider.getAllProductsInShoppingList(this.shoppingList.ListID).then((data: ShoppingListItem[]) => {

      if (data) {
        this.shoppingListItems = data;
        this.checkExpiredItems();
        this.content.resize();
        return Promise.resolve();
      }
      return Promise.reject('Empty');

    }, err => {
      console.error(err);
      LoadingService.hideAll();
    }).catch(error => { console.error(error); this.loader.hide(); });

  }

  private checkExpiredItems(): void {
    const isExpired: boolean = this.shoppingListItems.filter(item => item.isExpired).length > 0;
    if (isExpired) {
      const content: PopoverContent = this.popoversProvider.setContent(Strings.POPOVER_EXPIRED_ITEMS_TITLE, Strings.POPOVER_EXPIRED_ITEMS_MESSAGE);
      this.popoversProvider.show(content);
    }
  }

  public delete(): void {
    const array: ShoppingListItem[] = this.selectedItems.filter(item => item != undefined);
    let ok: boolean = true;
    if (array) {
      array.forEach(elem => {
        this.shoppingListProvider.deleteProductFromList(this.shoppingList.ListID, elem.product.SKU, elem.program_number).subscribe(
          data => {},
          error => {
            ok = false;
            console.error(error);
          }
        );
      });
      if (ok) {
        this.selectedItems.map((item, index) => {
          if (item !== null) {
            const price: string = (item.item_price * item.quantity).toFixed(Constants.DECIMAL_NUMBER);
            this.setOrderTotal({ status: 'uncheckedItem', price }, index);
            this.shoppingListItems = this.shoppingListItems.filter(elem => elem.product.SKU !== item.product.SKU);
          }
        });
      }
    }
  }

  public checkout(): void {
    const params: any = {
      isCheckout: true,
      list: this.shoppingList,
      paramsEquality: false
    };
    this.navigatorService.push(ShoppingListPage, params).catch(err => console.error(err));
  }

  private setOrderTotal(event: { status: string, price: number | string }, index: number): void {
    switch (event.status) {
      case 'checkedItem':
        this.selectedItems[index] = this.shoppingListItems[index];
        this.nrOfSelectedItems += 1;
        this.orderTotal += typeof event.price === 'number' ? event.price : parseFloat(event.price as string);
        break;
      case 'uncheckedItem':
        this.selectedItems[index] = undefined;
        this.nrOfSelectedItems -= 1;
        this.orderTotal -= typeof event.price === 'number' ? event.price : parseFloat(event.price as string);
        break;
      default:
    }
  }

  public onChecked($event: any, index: number): void {
    this.setOrderTotal($event, index);
    this.isSelectAll = this.nrOfSelectedItems === this.shoppingListItems.length;
  }

  public selectAll(): void {
    this.isSelectAll = !this.isSelectAll;
    this.orderTotal = 0;
    this.nrOfSelectedItems = 0;
    this.shoppingListItems.map((item, index) => {
      if (this.isSelectAll) {
        item.isCheckedInShoppingList = true;
        this.setOrderTotal({ status: 'checkedItem', price: item.quantity * item.item_price }, index);
      } else {
        item.isCheckedInShoppingList = false;
        this.selectedItems = [];
      }
    });
  }

  public continue(): void {
    if (this.nrOfSelectedItems === 0) {
      const content: PopoverContent = this.popoversProvider.setContent(Strings.SHOPPING_LIST_NO_ITEMS_TITLE, Strings.SHOPPING_LIST_NO_ITEMS_MESSAGE);
      this.popoversProvider.show(content);
    } else {
      const array: ShoppingListItem[] = this.selectedItems.filter(item => item !== undefined);
      const params: any = {
        shoppingListId: this.shoppingList.ListID,
        shoppingListItems: array,
        orderTotal: this.orderTotal
      };
      this.navigatorService.push(CustomerLocationPage, params).catch(err => console.error(err));
    }
  }

  public onSearched($event: any): void {

    this.shoppingListProvider.getAllProductsInShoppingList(this.shoppingList.ListID).then((data: ShoppingListItem[]) => {
      const params: any = {
        list: this.shoppingList,
        shoppingListItems: this.shoppingListProvider.search(data, $event),
        isCheckout: this.isCheckout,
        fromSearch: true
      };

      this.navigatorService.push(ShoppingListPage, params, { paramsEquality: getNavParam(this.navParams, 'fromSearch', 'boolean') ? false : true } as NavOptions).catch(err => console.error(err));
    });
  }

  public onCheckedToDetails($event: { product: Product, program_number: string, id: number, quantity: number }): void {
    this.navigatorService.push(ProductPage, {
      product: $event.product,
      programNumber: $event.program_number,
      fromShoppingList: true,
      shoppingListId: this.shoppingList.ListID,
      id: $event.id,
      quantity: $event.quantity
    }).catch(err => console.error(err));
  }

  public buttonClicked($event: { type: string }): void {
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
      default:
    }
  }
  private scan(): void {
    this.scannerService.scan(this.shoppingList, this.shoppingListItems);
  }

  private getListDetails(): void {
    let message: string = '';
    if (this.isCustomList) {
      message = this.translator.translate(Strings.SHOPPING_LIST_CUSTOM_DESCRIPTION);
    }
    const content: PopoverContent = this.popoversProvider.setContent(this.shoppingList.ListName, message + this.shoppingList.ListDescription);
    this.popoversProvider.show(content);
  }

  private removeList(): void {
    const content: PopoverContent = this.popoversProvider.setContent(Strings.SHOPPING_LIST_DELETE_CONF_TITLE, Strings.SHOPPING_LIST_DELETE_CONF_MESSAGE,
      Strings.MODAL_BUTTON_YES, Strings.MODAL_BUTTON_CANCEL, undefined, Constants.POPOVER_DELETE_LIST_CONFIRMATION);

    this.popoversProvider.show(content).subscribe((data: DefaultPopoverResult) => {
      if (data.optionSelected === 'OK') {
        this.shoppingListProvider.removeShoppingList(this.shoppingList.ListID).subscribe(removedData => {
          this.events.publish('DeletedList', this.shoppingList.ListID);
          this.navigatorService.pop().catch(err => console.error(err));
        });
      }
    });
  }

  public doRefresh($event: any): void {
    this.fillList().then(() => {
      $event.complete();
    }).catch(() => {
      $event.complete();
    });
  }

  public refreshPulling($event: any): void {
    this.touchend();
  }

  public touchstart(index: number): void {
    this.holdTimeoutReference = setTimeout(() => {
      this.shoppingListItems[index].isCheckedInShoppingList = true;
      this.selectedItems[index] = this.shoppingListItems[index];
      this.nrOfSelectedItems += 1;
      this.isDeleteMode = true;
      this.navigatorService.oneTimeBackButtonOverride(() => {
        this.isDeleteMode = false;
      });
    }, Constants.HOLD_TIME_IN_MS_TO_DELETE_MODE);

  }

  private touchend(): void {
    clearTimeout(this.holdTimeoutReference);
  }

  public scrollStart(): void {
    this.touchend();
  }
}
