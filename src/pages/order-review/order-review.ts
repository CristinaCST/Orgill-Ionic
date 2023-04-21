import { Component, OnInit } from '@angular/core';
import { NavParams, PopoverController, Popover } from 'ionic-angular';
import { CustomerLocation } from '../../interfaces/models/customer-location';
import { ShoppingListsProvider } from '../../providers/shopping-lists/shopping-lists';
import { ShoppingListItem } from '../../interfaces/models/shopping-list-item';
// import moment from 'moment';
import { OrderConfirmationPage } from '../order-confirmation/order-confirmation';
import { NavigatorService } from '../../services/navigator/navigator';
import { LocationElement } from '../../interfaces/models/location-element';
import { Product } from '../../interfaces/models/product';
import { ProductProvider } from '../../providers/product/product';
// import { DatabaseOrder } from '../../interfaces/models/database-order';
// import { ProductListInfo } from '../../interfaces/models/product-list-info';
import { getNavParam } from '../../helpers/validatedNavParams';
import { HotDealItem } from '../../interfaces/models/hot-deal-item';
import { HotDealConfirmation } from '../../interfaces/models/hot-deal-confirmation';
import * as Constants from '../../util/constants';
import * as Strings from '../../util/strings';
import { HotDealsService } from '../../services/hotdeals/hotdeals';
import { PopoverContent, DefaultPopoverResult, PopoversService } from '../../services/popovers/popovers';
import { LoadingService } from '../../services/loading/loading';
import { NavbarCustomButton } from '../../interfaces/models/navbar-custom-button';
import { MoreOptionsComponent } from '../../components/more-options/more-options';

@Component({
  selector: 'page-order-review',
  templateUrl: 'order-review.html'
})
export class OrderReviewPage implements OnInit {
  public orderMethod: number;
  public postOffice: string = '-';
  public location: CustomerLocation;
  public shoppingListId: number;
  public shoppingListItems: ShoppingListItem[];
  public orderTotal: number;
  private readonly shoppingListProgramNumbers: string[] = [];
  private readonly confirmationNumbers: number[] = [];
  public isHotDeal: boolean = false;
  public hotLocations: LocationElement[];
  public hotDealItem: HotDealItem;
  public readonly sendToOrgillMethod: number = Constants.SEND_TO_ORGILL_METHOD;
  public forwardButtonText: string;
  private readonly simpleLoader: LoadingService;
  public customButtons: NavbarCustomButton[] = [];
  private supportButtonPopover: Popover;

  constructor(
    private readonly navigatorService: NavigatorService,
    private readonly navParams: NavParams,
    private readonly shoppingListsProvider: ShoppingListsProvider,
    public readonly productProvider: ProductProvider,
    private readonly hotDealsService: HotDealsService,
    private readonly popoversService: PopoversService,
    private readonly loadingService: LoadingService,
    private readonly popoverController: PopoverController
  ) {
    this.simpleLoader = this.loadingService.createLoader();
  }

  public ngOnInit(): void {
    this.orderMethod = getNavParam(this.navParams, 'orderMethod', 'number');
    this.forwardButtonText =
      this.orderMethod === Constants.CHECKOUT_METHOD ? Strings.ORDER_REVIEW_PURCHASE : Strings.ORDER_REVIEW_SEND;
    this.postOffice = getNavParam(this.navParams, 'postOffice');
    this.location = getNavParam(this.navParams, 'location', 'object');
    this.shoppingListId = getNavParam(this.navParams, 'shoppingListId', 'number');
    this.shoppingListItems = getNavParam(this.navParams, 'shoppingListItems', 'object');
    this.orderTotal = getNavParam(this.navParams, 'orderTotal', 'number');
    this.isHotDeal = getNavParam(this.navParams, 'isHotDeal', 'boolean');
    this.hotDealItem = getNavParam(this.navParams, 'hotDealItem', 'object');

    if (this.hotDealItem) {
      this.isHotDeal = true;

      this.hotLocations = this.hotDealItem.LOCATIONS;
    }

    if (this.isHotDeal) {
      this.customButtons.push({
        action: $event => this.showSupportButton($event),
        icon: 'more'
      });
    }

    if (this.shoppingListItems) {
      this.shoppingListItems.forEach(listItem => {
        this.shoppingListProgramNumbers[listItem.program_number] = listItem.program_number;
      });
    }
  }

  public getOrderQuery(programNumber: string, items: ShoppingListItem[]): string {
    let query: string =
      this.location.shiptono + ':' + (this.postOffice ? this.postOffice : '') + ':' + programNumber + ':';
    items.forEach((item, index) => {
      query += item.product.sku + '|' + item.quantity.toString() + (index < items.length - 1 ? ':' : '');
    });
    return query;
  }

  private getHotDealQuery(programNumber: string, item: Product, locations: LocationElement[]): any[] {
    const query: any[] = [];
    locations.forEach(location => {
      query.push({
        order:
          location.LOCATION.shiptono +
          ':' +
          (location.POSTOFFICE ? location.POSTOFFICE : '') +
          ':' +
          (programNumber ? programNumber : '') +
          ':' +
          item.sku +
          '|' +
          location.QUANTITY.toString()
      });
    });
    return query;
  }

  private showSupportButton($event: any): void {
    this.supportButtonPopover = this.popoverController.create(
      MoreOptionsComponent,
      {
        action: () => {
          this.supportModal();
        }
      },
      { cssClass: 'more-actions' }
    );
    this.supportButtonPopover.present({ ev: $event });
  }

  private supportModal(): void {
    this.supportButtonPopover.dismiss();
    const content: PopoverContent = {
      type: Constants.POPOVER_SUPPORT_HOT_DEAL,
      title: Strings.GENERIC_MODAL_TITLE,
      positiveButtonText: Strings.MODAL_BUTTON_OK,
      dismissButtonText: Strings.MODAL_BUTTON_CANCEL,
      additionalData: {
        validator: (code: string) => this.hotDealsService.overrideDealAccess(this.hotDealItem.ITEM.sku, code)
      }
    };

    this.popoversService.show(content);
  }

  public purchase(): void {
    this.simpleLoader.show();
    Object.keys(this.shoppingListProgramNumbers).map((programNumber, index) => {
      const orderItems: ShoppingListItem[] = this.shoppingListItems.filter(
        item => item.program_number === programNumber
      );

      const itemsIds: any = orderItems.map(item => ({ sku: item.product.sku, order_quantity: `${item.quantity}` }));
      // const productListInfo: ProductListInfo = {
      //   order_method: `${this.orderMethod}`,
      //   order_query: this.getOrderQuery(programNumber, orderItems)
      // };
      // const insertToDBInfo: DatabaseOrder = {
      //   PO: this.postOffice,
      //   date: moment().format('MM/DD/YYYY'),
      //   location: this.location.shiptono,
      //   type: this.orderMethod,
      //   total: this.orderTotal,
      //   program_number: programNumber
      // };

      this.shoppingListsProvider
        .orderProducts({
          customer_number: this.location.customerno,
          po_number: this.postOffice,
          program_number: programNumber,
          order_method: `${this.orderMethod}`,
          item_list: itemsIds
        })
        .then(data => {
          this.removeItemsFromList(orderItems);
          if (data.confirmationNumber > 0) {
            this.confirmationNumbers.push(data.confirmationNumber);
            if (index === Object.keys(this.shoppingListProgramNumbers).length - 1) {
              const navigationParams: any = {
                confirmationNumbers: this.confirmationNumbers,
                orderTotal: this.orderTotal,
                orderMethod: this.orderMethod
              };
              this.simpleLoader.hide();
              this.navigatorService.push(OrderConfirmationPage, navigationParams).catch(err => console.error(err));
            }
          }
        })
        .catch(err => {
          LoadingService.hideAll();
          console.error(err);
        });
    });
  }

  private removeItemsFromList(items: ShoppingListItem[]): void {
    items.forEach(item => {
      this.shoppingListsProvider
        .deleteProductFromList(this.shoppingListId, item.product.sku, item.program_number)
        .subscribe(res => {
          // This is here to solve Schrodinger's Observable.
        });
    });
  }

  public purchaseHotDeal(): void {
    // this.simpleLoader.show();
    // this.hotDealsService
    //   .checkGeofence()
    //   .then(
    //     isInRange => {
    //       if (!isInRange && !this.hotDealsService.dealHasValidOverride(this.hotDealItem.ITEM.sku)) {
    //         return Promise.reject('range');
    //       }
    //       return Promise.resolve();
    //     },
    //     err => {
    //       this.simpleLoader.hide();
    //     }
    //   )
    //   .then(
    //     () => {
    //       const programNumber: string = this.hotDealItem.PROGRAM.program_no;
    //       const orderItem: Product = this.hotDealItem.ITEM;
    //       const productListInfo: any = {
    //         order_method: 2,
    //         order_query: this.getHotDealQuery(programNumber, orderItem, this.hotDealItem.LOCATIONS)
    //       };
    //       this.productProvider
    //         .orderHotDeal(productListInfo)
    //         .then((data: any) => {
    //           const confirmations: HotDealConfirmation[] = [];
    //           data.forEach((result: HotDealConfirmation) => {
    //             confirmations.push(result);
    //           });
    //           const navigationParams: any = {
    //             orderMethod: this.orderMethod,
    //             hotDealConfirmations: confirmations,
    //             hotDealLocations: this.hotDealItem.LOCATIONS,
    //             hotDealPurchase: true,
    //             hotDealItem: this.hotDealItem
    //           };
    //           this.simpleLoader.hide();
    //           this.navigatorService.push(OrderConfirmationPage, navigationParams).catch(err => console.error(err));
    //         })
    //         .catch(err => console.error(err));
    //     },
    //     rej => {
    //       const popoverContent: PopoverContent = {
    //         type: Constants.PERMISSION_MODAL,
    //         title: Strings.GENERIC_MODAL_TITLE,
    //         message: Strings.LOCATION_TOO_FAR,
    //         positiveButtonText: Strings.MODAL_BUTTON_OK
    //       };
    //       LoadingService.hideAll();
    //       // Return the popover observable
    //       this.popoversService.show(popoverContent).subscribe((result: DefaultPopoverResult) => {});
    //     }
    //   );
  }

  public cancel(): void {
    this.navigatorService.pop().catch(err => console.error(err));
  }
}
