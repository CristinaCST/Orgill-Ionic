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
import { LoadingService } from '../../services/loading/loading';
import { NavigatorService } from '../../services/navigator/navigator';
import { ScannerService } from '../../services/scanner/scanner';
import { Product } from '../../interfaces/models/product';
import { getNavParam } from '../../helpers/validatedNavParams';
import { PricingService } from '../../services/pricing/pricing';
import { ReloadService } from '../../services/reload/reload';

@Component({
  selector: 'page-shopping-list',
  templateUrl: 'shopping-list.html'
})
export class ShoppingListPage {
  @ViewChild(Content) private readonly content: Content;

  private _deleteMode: boolean = false;

  public get isDeleteMode(): boolean {
    return this._deleteMode;
  }

  public set isDeleteMode(value: boolean) {
    this._deleteMode = value;
    if (!value) {
      this.selectedItems = [];
      this.shoppingListItems.forEach(item => item.isCheckedInShoppingList = false);
    }
  }

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
  public fromSearch: boolean = false;
  public holdCheckTimeout: boolean = false; // Flag to disable checking of items if we just entered Delete mode

  constructor(
    private readonly navParams: NavParams,
    private readonly navigatorService: NavigatorService,
    private readonly shoppingListProvider: ShoppingListsProvider,
    private readonly popoversService: PopoversService,
    private readonly events: Events,
    private readonly loading: LoadingService,
    private readonly scannerService: ScannerService,
    private readonly pricingService: PricingService,
    private readonly reloadService: ReloadService) {

    this.loader = this.loading.createLoader();
    this.menuCustomButtons = [{ action: 'detailsList', icon: 'information-circle' }, { action: 'scan', icon: 'barcode' }];
  }

  public ngOnInit(): void {
    this.events.subscribe(Constants.EVENT_LOADING_FAILED, this.loadingFailedHandler);
  }

  public ngOnDestroy(): void {
    this.events.unsubscribe(Constants.EVENT_LOADING_FAILED, this.loadingFailedHandler);
  }

  private readonly loadingFailedHandler = (culprit?: string): void => {
    if (culprit === 'shopping list products') {
      this.fillList();
    }
  }

  public ionViewWillLeave(): void {
    this.events.unsubscribe(Constants.EVENT_PRODUCT_ADDED_TO_SHOPPING_LIST);
  }

  public ionViewWillEnter(): void {
    this.events.subscribe(Constants.EVENT_PRODUCT_ADDED_TO_SHOPPING_LIST, () => {
      this.fillList();
    });

    this.shoppingList = getNavParam(this.navParams, 'list', 'object');
    this.isCheckout = getNavParam(this.navParams, 'isCheckout', 'boolean');
    this.fromSearch = getNavParam(this.navParams, 'fromSearch', 'boolean');
  
    this.isCustomList = (this.shoppingList.ListType !== Constants.DEFAULT_LIST_TYPE) && (this.shoppingList.ListType !== Constants.MARKET_ONLY_LIST_TYPE);

    if (this.isCustomList) {
      if (this.menuCustomButtons.map(d => d.action).indexOf('deleteList') === -1) {
        this.menuCustomButtons.push({
          action: 'deleteList',
          icon: 'trash'
        });
      }
    }


    if (this.fromSearch) {
      this.fillFromSearch();
    } else {
      this.fillList();
    }
  }

  // TODO: Sebastian: REFACTORING
  private fillFromSearch(): void {
    this.shoppingListItems = getNavParam(this.navParams, 'shoppingListItems', 'object');
    if (!this.shoppingListItems) {
      this.shoppingListItems = [];
    }
    this.content.resize();
  }

  private fillList(): Promise<void> {
    this.shoppingListItems = [];

    this.loader.show();

    return this.shoppingListProvider.getAllProductsInShoppingList(this.shoppingList.ListID).then((data: ShoppingListItem[]) => {
      if (data) {
        this.shoppingListItems = data;
        this.checkExpiredItems();
        this.content.resize();
      } else {
        this.shoppingListItems = [];
      }

      this.loader.hide();
      return Promise.resolve();
    }).catch(error => {
      this.loader.hide();
      this.reloadService.paintDirty('shopping list products');
      console.error(error);
    });

  }

  private checkExpiredItems(): void {
    const isExpired: boolean = this.shoppingListItems.filter(item => item.isExpired).length > 0;
    if (isExpired) {
      const content: PopoverContent = this.popoversService.setContent(Strings.POPOVER_EXPIRED_ITEMS_TITLE, Strings.POPOVER_EXPIRED_ITEMS_MESSAGE);
      this.popoversService.show(content);
    }
  }

  public delete(): void {
    const deletePopoverContent: PopoverContent = this.popoversService.setContent(Strings.GENERIC_MODAL_TITLE, Strings.DELETE_ITEM_PROMPT_MESSAGE, Strings.MODAL_BUTTON_YES, undefined, Strings.MODAL_BUTTON_CANCEL);
    this.popoversService.show(deletePopoverContent).subscribe(res => {
      if (res.optionSelected === 'OK') {
        this.deleteItems();
      }
    });
  }

  private deleteItems(): void {
    const array: ShoppingListItem[] = this.selectedItems.filter(item => item !== undefined && item !== null);
    let ok: boolean = true;

    if (array) {
      array.forEach(elem => {
        this.shoppingListProvider.deleteProductFromList(this.shoppingList.ListID, elem.product.SKU, elem.program_number).subscribe(
          data => { },
          error => {
            ok = false;
            console.error(error);
          }
        );
      });
      if (ok) {
        this.selectedItems.map((item, index) => {
          if (item !== null && item !== undefined) {
            this.setOrderTotal({ status: 'uncheckedItem' }, index);
          }
        });

        const checkedItems: ShoppingListItem[] = this.shoppingListItems.filter(item => item.isCheckedInShoppingList);  //  Workaround for the fact that setOrderTotal actually unselects items 
        for (let i: number = this.shoppingListItems.length - 1; i >= 0; i--) {
          for (let j: number = checkedItems.length - 1; j >= 0; j--) {
            if (this.shoppingListItems[i].product.SKU === checkedItems[j].product.SKU) {
              checkedItems.splice(j, 1);      // Safe splice as we break out of this loop after this if
              this.shoppingListItems.splice(i, 1);  // Safe splice since we iterate from the end
              break;
            }
          }
        }

        if (this.shoppingListItems.length === 0) {
          this.isDeleteMode = false;
          if (this.isCheckout) {
            this.navigatorService.pop();
          }
        }
      }
    }
  }

  public checkout(): void {
    if (this.shoppingListItems.length === 0) {
      const content: PopoverContent = this.popoversService.setContent(Strings.SHOPPING_LIST_EMPTY_TITLE, Strings.SHOPPING_LIST_EMPTY_MESSAGE);
      this.popoversService.show(content);
      return;
    }
    const params: any = {
      isCheckout: true,
      list: this.shoppingList,
      paramsEquality: false
    };
    this.navigatorService.push(ShoppingListPage, params).catch(err => console.error(err));
  }

  private setOrderTotal(event: { status: string}, index: number): void {

    const item: ShoppingListItem = this.shoppingListItems[index];
    const price: number = this.pricingService.getShoppingListPrice(item.quantity, item.product, item.item_price);
    switch (event.status) {
      case 'checkedItem':
        this.selectedItems[index] = this.shoppingListItems[index];
        this.nrOfSelectedItems++;
        this.orderTotal += price;
        break;
      case 'uncheckedItem':
        this.selectedItems[index] = undefined;
        this.nrOfSelectedItems--;
        this.orderTotal -= price;
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
        this.setOrderTotal({ status: 'checkedItem' }, index);
      } else {
        item.isCheckedInShoppingList = false;
        this.selectedItems = [];
      }
    });
  }

  public continue(): void {
    if (this.nrOfSelectedItems === 0) {
      const content: PopoverContent = this.popoversService.setContent(Strings.SHOPPING_LIST_NO_ITEMS_TITLE, Strings.SHOPPING_LIST_NO_ITEMS_MESSAGE);
      this.popoversService.show(content);
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

  public onSearched(searchString: string): void {

    this.shoppingListProvider.getAllProductsInShoppingList(this.shoppingList.ListID).then((data: ShoppingListItem[]) => {
      // let it =  this.shoppingListProvider.search(data, $event);
      const params: any = {
        list: this.shoppingList,
        shoppingListItems: this.shoppingListProvider.search(data, searchString),
        isCheckout: this.isCheckout,
        fromSearch: true
      };
      // console.log( this.shoppingListProvider.search(data, $event));

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
    let description: string = Strings.SHOPPING_LIST_DESCRIPTION_NOT_PROVIDED;

    if (this.isCustomList && this.shoppingList.ListDescription) {
      description = this.shoppingList.ListDescription;
    } else if (this.shoppingList.ListType === Constants.DEFAULT_LIST_TYPE) {
      description = Strings.SHOPPING_LIST_DESCRIPTION_REGULAR;
    } else if (this.shoppingList.ListType === Constants.MARKET_ONLY_LIST_TYPE) {
      description = Strings.SHOPPING_LIST_DESCRIPTION_MARKET;
    }

    const content: PopoverContent = this.popoversService.setContent(this.shoppingList.ListName, description);
    this.popoversService.show(content);
  }

  private removeList(): void {
    this.loader.show();
    const content: PopoverContent = this.popoversService.setContent(Strings.SHOPPING_LIST_DELETE_CONF_TITLE, Strings.SHOPPING_LIST_DELETE_CONF_MESSAGE,
      Strings.MODAL_BUTTON_YES, Strings.MODAL_BUTTON_CANCEL, undefined, Constants.POPOVER_DELETE_LIST_CONFIRMATION);

    this.popoversService.show(content).subscribe((data: DefaultPopoverResult) => {
      this.loader.hide();
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
    if (this.isCheckout || this.isDeleteMode) {
      return;
    }
    
    this.holdTimeoutReference = setTimeout(() => {
      const item: ShoppingListItem = this.shoppingListItems[index];
      item.isCheckedInShoppingList = true;
      this.setOrderTotal({ status: 'checkedItem' }, index);
      this.isDeleteMode = true;
      this.navigatorService.oneTimeBackButtonOverride(() => {
        this.isDeleteMode = false;
      });
      this.holdCheckTimeout = true;
    }, Constants.HOLD_TIME_TO_DELETE_MODE);

  }

  private touchend(): void {
    this.holdCheckTimeout = false; 
    clearTimeout(this.holdTimeoutReference);
  }

  public scrollStart(): void {
    this.touchend();
  }
}
