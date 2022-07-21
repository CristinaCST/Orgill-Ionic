import { Component, ViewChild } from '@angular/core';
import { Content, Events, NavParams, NavOptions } from 'ionic-angular';

import { ShoppingList } from '../../interfaces/models/shopping-list';
import * as Constants from '../../util/constants';
import * as Strings from '../../util/strings';
import { ShoppingListsProvider } from '../../providers/shopping-lists/shopping-lists';
import { ShoppingListItem } from '../../interfaces/models/shopping-list-item';
import { SelectItemEvent } from '../../interfaces/models/select-item-event';
import { PopoversService, DefaultPopoverResult, PopoverContent } from '../../services/popovers/popovers';
import { CustomerLocationPage } from '../customer-location/customer-location';
import { ProductPage } from '../product/product';
import { LoadingService } from '../../services/loading/loading';
import { NavigatorService } from '../../services/navigator/navigator';
import { ScannerService } from '../../services/scanner/scanner';
import { Product } from '../../interfaces/models/product';
import { getNavParam } from '../../helpers/validatedNavParams';
import { PricingService } from '../../services/pricing/pricing';
import { Platform } from 'ionic-angular/platform/platform';
import { NavbarCustomButton } from '../../interfaces/models/navbar-custom-button';
import { Catalog } from '../../pages/catalog/catalog';
import { SearchService } from '../../services/search/search';

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
      this.shoppingListItems.forEach(item => (item.isCheckedInShoppingList = false));
    }
  }

  private shoppingList: ShoppingList;
  public selectedItems: ShoppingListItem[] = [];
  private shoppingListItems: ShoppingListItem[] = [];
  private isCustomList: boolean = false;
  private orderTotal: number = 0;
  private isCheckout: boolean = false;
  private isSelectAll: boolean = false;
  private readonly menuCustomButtons: NavbarCustomButton[] = [];
  private readonly loader: LoadingService;
  private holdTimeoutReference: number;
  public fromSearch: boolean = false;
  public holdCheckTimeout: boolean = false; // Flag to disable checking of items if we just entered Delete mode
  protected isLoading: boolean = true;

  constructor(
    private readonly navParams: NavParams,
    private readonly navigatorService: NavigatorService,
    private readonly shoppingListProvider: ShoppingListsProvider,
    private readonly popoversService: PopoversService,
    private readonly events: Events,
    private readonly loading: LoadingService,
    private readonly scannerService: ScannerService,
    private readonly pricingService: PricingService,
    private readonly platform: Platform,
    private readonly searchService: SearchService
  ) {
    this.loader = this.loading.createLoader();
    this.menuCustomButtons = [
      { action: () => this.getListDetails(), icon: 'information-circle' },
      { action: () => this.scan(), icon: 'barcode' }
    ];
  }

  public ngOnInit(): void {
    this.events.subscribe(Constants.EVENT_LOADING_FAILED, this.loadingFailedHandler);
  }

  public ngOnDestroy(): void {
    this.events.unsubscribe(Constants.EVENT_LOADING_FAILED, this.loadingFailedHandler);
  }

  private readonly loadingFailedHandler = (culprit?: string): void => {
    if (culprit === 'shopping list products' || !culprit) {
      this.fillList();
    }
  };

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

    this.isCustomList =
      this.shoppingList.ListType !== Constants.DEFAULT_LIST_TYPE &&
      this.shoppingList.ListType !== Constants.MARKET_ONLY_LIST_TYPE;

    if (this.isCustomList) {
      if (this.menuCustomButtons.map(button => button.identifier).indexOf('deleteList') === -1) {
        this.menuCustomButtons.push({
          identifier: 'deleteList',
          action: () => this.removeList(),
          icon: 'trash'
        });
      }
    }

    if (this.fromSearch) {
      this.fillFromSearch();
      this.updateTotalPrice();
    } else {
      this.fillList().then(() => {
        this.shoppingListItems.forEach(item => {
          item.isCheckedInShoppingList = Boolean(
            this.selectedItems.find(searchItem => {
              return searchItem.product.product.sku === item.product.sku;
            })
          );
        });
        this.shoppingListItems.length === this.selectedItems.length
          ? (this.isSelectAll = true)
          : (this.isSelectAll = false);
        this.updateTotalPrice();
      });
    }
  }

  private updateTotalPrice(): void {
    this.orderTotal = this.selectedItems.reduce((accumulator, element) => (accumulator += Number(element.price)), 0);
  }

  // TODO: Sebastian: REFACTORING
  private fillFromSearch(): void {
    this.selectedItems = getNavParam(this.navParams, 'selectedItemsOnSearch', 'object');
    this.shoppingListItems = getNavParam(this.navParams, 'shoppingListItems', 'object');
    this.shoppingListItems.map(item => {
      item.isCheckedInShoppingList = Boolean(
        this.selectedItems.find(itemSearch => itemSearch.product.product.sku === item.product.sku)
      );
    });
    this.orderTotal = getNavParam(this.navParams, 'orderTotalOnSearch', 'number');
    if (!this.shoppingListItems) {
      this.shoppingListItems = [];
    }
    this.content.resize();
  }

  private fillList(): Promise<void> {
    this.isLoading = true;
    this.shoppingListItems = [];

    this.loader.show();

    return this.shoppingListProvider
      .getAllProductsInShoppingList(this.shoppingList.ListID)
      .then((data: ShoppingListItem[]) => {
        if (data) {
          this.shoppingListItems = data
            .filter(item => item.item_price > 0)
            .map(item => {
              item.isCheckedInShoppingList = Boolean(
                this.selectedItems.find(
                  findItem => findItem.product.product.sku === item.product.sku && findItem.isCheckedInShoppingList
                )
              );
              return item;
            });
          this.checkExpiredItems();
          this.checkQuantityItems();
          this.updateTotalPrice();
          this.content.resize();
        } else {
          this.shoppingListItems = [];
        }

        this.loader.hide();
        this.isLoading = false;
        return Promise.resolve();
      })
      .catch(error => {
        this.isLoading = false;
        this.loader.hide();
        // this.reloadService.paintDirty('shopping list products');
        console.error(error);
      });
  }

  private checkExpiredItems(): void {
    const isExpired: boolean = this.shoppingListItems.filter(item => item.isExpired).length > 0;
    if (isExpired) {
      const content: PopoverContent = this.popoversService.setContent(
        Strings.POPOVER_EXPIRED_ITEMS_TITLE,
        Strings.POPOVER_EXPIRED_ITEMS_MESSAGE
      );
      this.popoversService.show(content);
    }
  }

  private removeNoQuantityProducts(listOfProductsForRemove: ShoppingListItem[]): void {
    listOfProductsForRemove.forEach(elem => {
      this.shoppingListProvider
        .deleteProductFromList(this.shoppingList.ListID, elem.product.sku, elem.program_number)
        .subscribe(
          () => {},
          error => {
            console.error(error);
          }
        );
    });
  }

  private checkQuantityItems(): void {
    if (this.shoppingListItems.length > 0) {
      const noQuantityProducts: ShoppingListItem[] = this.shoppingListItems.filter(item => item.quantity < 1);
      const content: PopoverContent = this.popoversService.setContent(
        Strings.POPOVER_NOQUANTITY_ITEMS_TITLE,
        JSON.stringify(noQuantityProducts),
        undefined,
        undefined,
        undefined,
        'notAvailable'
      );
      if (noQuantityProducts.length > 0) {
        this.popoversService.show(content);
        this.removeNoQuantityProducts(noQuantityProducts);
        this.popoversService.popover.onDidDismiss(data => {
          if (data.type === 'notAvailable') {
            this.fillList();
          }
        });
      }
    }
  }

  public delete(): void {
    const deletePopoverContent: PopoverContent = this.popoversService.setContent(
      Strings.GENERIC_MODAL_TITLE,
      Strings.DELETE_ITEM_PROMPT_MESSAGE,
      Strings.MODAL_BUTTON_YES,
      undefined,
      Strings.MODAL_BUTTON_CANCEL
    );
    this.popoversService.show(deletePopoverContent).subscribe(res => {
      if (res.optionSelected === 'OK') {
        this.deleteItems();
      }
    });
  }

  private deleteItems(): void {
    let ok: boolean = true;

    if (this.selectedItems.length > 0) {
      this.selectedItems.forEach(selectedItem => {
        this.shoppingListProvider
          .deleteProductFromList(
            this.shoppingList.ListID,
            selectedItem.product.product.sku,
            selectedItem.product.program_number
          )
          .subscribe(
            data => {},
            error => {
              ok = false;
              console.error(error);
            }
          );
      });
      if (ok) {
        const checkedItems: ShoppingListItem[] = this.shoppingListItems.filter(item => item.isCheckedInShoppingList); //  Workaround for the fact that setOrderTotal actually unselects items

        for (const checkedItem of checkedItems) {
          this.shoppingListItems.splice(
            this.shoppingListItems.findIndex(item => item.product.sku === checkedItem.product.sku),
            1
          );
          this.selectedItems.splice(
            this.selectedItems.findIndex(
              shoppingListItem => shoppingListItem.product.product.sku === checkedItem.product.sku
            ),
            1
          );
          this.updateTotalPrice();
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
    this.searchService.clearText();
    if (this.shoppingListItems.length === 0) {
      const content: PopoverContent = this.popoversService.setContent(
        Strings.SHOPPING_LIST_EMPTY_TITLE,
        Strings.SHOPPING_LIST_EMPTY_MESSAGE
      );
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

  // TODO: This system is overly complicated
  private setOrderTotal(event: SelectItemEvent): void {
    const item: any = event;
    switch (event.status) {
      case 'checkedItem':
        const alreadySelected: boolean =
          this.selectedItems.filter(selectedItem => selectedItem.product.sku === event.product.product.sku).length > 0;
        if (!alreadySelected) {
          this.selectedItems.push(item);
        }
        break;
      case 'uncheckedItem':
        this.selectedItems.splice(
          this.selectedItems.findIndex(
            shoppingListItem => shoppingListItem.product.product.sku === item.product.product.sku
          ),
          1
        );
        break;
      default:
        console.warn('no op specified in setOrderTotal');
    }
    this.updateTotalPrice();
  }

  public onChecked($event: any): void {
    this.setOrderTotal($event);
    this.selectedItems.length === this.shoppingListItems.length
      ? (this.isSelectAll = true)
      : (this.isSelectAll = false);
  }

  public selectAll(): void {
    this.isSelectAll = !this.isSelectAll;
    this.shoppingListItems.forEach(item => {
      if (!item.isCheckedInShoppingList) {
        item.isCheckedInShoppingList = true;
        const correctPrice: number = this.pricingService.getShoppingListPrice(
          item.quantity,
          item.product,
          item.item_price
        );
        this.setOrderTotal({ status: 'checkedItem', price: String(correctPrice), product: item });
      }
      item.isCheckedInShoppingList = this.isSelectAll;
      this.updateTotalPrice();

      if (!this.isSelectAll && this.fromSearch) {
        this.shoppingListItems.map(shoppingListItem => {
          this.selectedItems = this.selectedItems.filter(
            shoppItem => shoppItem.product.product.sku !== shoppingListItem.product.sku
          );
        });
        this.updateTotalPrice();
      }

      if (!this.isSelectAll && !this.fromSearch) {
        this.selectedItems = [];
        this.updateTotalPrice();
      }
    });
  }

  public continue(): void {
    if (this.selectedItems.length === 0) {
      const content: PopoverContent = this.popoversService.setContent(
        Strings.SHOPPING_LIST_NO_ITEMS_TITLE,
        Strings.SHOPPING_LIST_NO_ITEMS_MESSAGE
      );
      this.popoversService.show(content);
    } else {
      const params: any = {
        shoppingListId: this.shoppingList.ListID,
        shoppingListItems: this.selectedItems.map(item => item.product),
        orderTotal: this.orderTotal
      };
      this.navigatorService.push(CustomerLocationPage, params).catch(err => console.error(err));
    }
  }

  public onSearched(searchString: string): void {
    this.loader.show();
    this.shoppingListProvider.getAllProductsInShoppingList(this.shoppingList.ListID).then(
      (data: ShoppingListItem[]) => {
        const params: any = {
          list: this.shoppingList,
          shoppingListItems: this.shoppingListProvider.search(data, searchString),
          isCheckout: this.isCheckout,
          fromSearch: true,
          orderTotalOnSearch: this.orderTotal,
          selectedItemsOnSearch: this.selectedItems
        };
        this.loader.hide();
        this.navigatorService
          .push(ShoppingListPage, params, {
            paramsEquality: getNavParam(this.navParams, 'fromSearch', 'boolean') ? false : true
          } as NavOptions)
          .catch(err => console.error(err));
      },
      err => {
        LoadingService.hideAll();
      }
    );
  }

  public onCheckedToDetails($event: { product: Product; program_number: string; id: number; quantity: number }): void {
    this.navigatorService
      .push(ProductPage, {
        product: $event.product,
        programNumber: $event.program_number,
        fromShoppingList: true,
        shoppingListId: this.shoppingList.ListID,
        id: $event.id,
        quantity: $event.quantity
      })
      .catch(err => console.error(err));
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
    const content: PopoverContent = this.popoversService.setContent(
      Strings.SHOPPING_LIST_DELETE_CONF_TITLE,
      Strings.SHOPPING_LIST_DELETE_CONF_MESSAGE,
      Strings.MODAL_BUTTON_YES,
      Strings.MODAL_BUTTON_CANCEL,
      undefined,
      Constants.POPOVER_DELETE_LIST_CONFIRMATION
    );

    this.popoversService.show(content).subscribe((data: DefaultPopoverResult) => {
      if (data.optionSelected === 'OK') {
        this.loader.show();
        this.shoppingListProvider.removeShoppingList(this.shoppingList.ListID).subscribe(removedData => {
          this.events.publish('DeletedList', this.shoppingList.ListID);
          this.navigatorService
            .setRoot(Catalog)
            .then(() => this.loader.hide())
            .catch(err => console.error(err));
        });
      }
    });
  }

  public doRefresh($event: any): void {
    this.fillList()
      .then(() => {
        $event.complete();
      })
      .catch(() => {
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

      if (!this.platform.is('ios')) {
        item.isCheckedInShoppingList = true;
        this.setOrderTotal({ status: 'checkedItem' });
      }

      this.isDeleteMode = true;
      this.navigatorService.oneTimeBackButtonOverride(() => {
        this.isDeleteMode = false;
      });

      if (!this.platform.is('ios')) {
        this.holdCheckTimeout = true;
      }
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
