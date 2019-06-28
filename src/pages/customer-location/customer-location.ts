import { Component, OnInit, ViewChildren } from '@angular/core';
import { NavParams, Keyboard, Events } from 'ionic-angular';
import { CustomerLocation } from '../../interfaces/models/customer-location';
import { ShoppingListItem } from '../../interfaces/models/shopping-list-item';
import { UserInfoService } from '../../services/user-info/user-info';
import { OrderReviewPage } from '../order-review/order-review';
import { NavigatorService } from '../../services/navigator/navigator';
import * as Constants from '../../util/constants';
import * as Strings from '../../util/strings';
import { LocationElement } from '../../interfaces/models/location-element';
import { PopoversService, PopoverContent } from '../../services/popovers/popovers';
import { PricingService } from '../../services/pricing/pricing';
import { getNavParam } from '../../util/validatedNavParams';


@Component({
  selector: 'page-customer-location',
  templateUrl: 'customer-location.html'
})
export class CustomerLocationPage implements OnInit {


  @ViewChildren('QTYinput') public QuantityInput: string;

  public readonly sendToOrgillMethod: number = 1;
  public readonly checkoutMethod: number = 2;

  public postOffice: string;
  public userLocations: CustomerLocation[] = [];
  public selectedLocation: CustomerLocation;
  public hotDealLocations: LocationElement[] = [];
  public postOffices: number[];


  private shoppingListId: number;
  private shoppingListItems: ShoppingListItem[] = [];
  private orderTotal: number;
  private isHotDeal: boolean = false;
  public noLocation: boolean = false;
  private hotDealItem: any;

  constructor(private readonly navigatorService: NavigatorService,
              private readonly navParams: NavParams,
              private readonly userInfoProvider: UserInfoService,
              private readonly popoverProvider: PopoversService,
              private readonly pricingService: PricingService,
              private readonly keyboard: Keyboard,
              private readonly events: Events) {
  }


  public ngOnInit(): void {
    this.shoppingListId = getNavParam(this.navParams, 'shoppingListId', 'number');
    this.shoppingListItems = getNavParam(this.navParams, 'shoppingListItems', 'object');
    this.orderTotal = getNavParam(this.navParams, 'orderTotal', 'number');
    this.hotDealItem = getNavParam(this.navParams, 'hotDeal', 'object');
    this.isHotDeal = this.hotDealItem ? true : false;

    this.userInfoProvider.getUserLocations().subscribe(locations => {
      if (!locations || Constants.DEBUG_NO_LOCATIONS) {
        this.noLocation = true;
        return;
      }


      this.userLocations = this.sortLocations(JSON.parse(locations.d));
      if (this.userLocations.length > 0) {
        this.selectedLocation = this.userLocations[0];
      }

      const min_value: number = this.isHotDeal ? this.pricingService.validateQuantity(1, this.hotDealItem.PROGRAM, this.hotDealItem.ITEM, true) : 1;

      this.userLocations.forEach(element => {

        const locElement: LocationElement = {
          LOCATION: element,
          POSTOFFICE: undefined,
          QUANTITY: min_value,
          WANTED: false
        };

        this.hotDealLocations.push(locElement);
      });

    });


  }

  public onFocus(): void {
    if (this.keyboard.isOpen()) {
      this.events.publish(Constants.EVENT_SCROLL_INTO_VIEW);
    }
  }

  public closeKeyboard(keyCode: string): void {
    this.keyboard.close();
  }

  public sortLocations(locations: CustomerLocation[]): CustomerLocation[] {
    return locations.sort((location1, location2): number => {
      return location1.CUSTOMERNAME.toLowerCase().localeCompare(location2.CUSTOMERNAME.toLowerCase());
    });
  }

  public sendToOrgill(): void {
    this.redirectToOrderReview(this.sendToOrgillMethod);
  }

  public checkout(): void {
    this.redirectToOrderReview(this.checkoutMethod);
  }

  public redirectToOrderReview(orderMethod: number): void {
    if (this.shoppingListId != undefined) {
      const params: any = {
        orderMethod,
        postOffice: this.postOffice,
        location: this.selectedLocation,
        shoppingListId: this.shoppingListId,
        shoppingListItems: this.shoppingListItems,
        orderTotal: this.orderTotal
      };
      this.navigatorService.push(OrderReviewPage, params);
    }

    if (this.isHotDeal) {
      const selectedLocations: LocationElement[] = [];

      let valid: boolean = true;

      this.hotDealLocations.forEach(element => {
        if (element.WANTED) {

          if (element.QUANTITY == undefined || element.QUANTITY === 0) {
            valid = false;
          }

          selectedLocations.push(element);
        }
      });

      if (!valid) {
        const content: PopoverContent = {
          type: Constants.POPOVER_INFO,
          title: Strings.GENERIC_MODAL_TITLE,
          message: Strings.HOT_DEAL_LOCATION_INVALID,
          positiveButtonText: Strings.MODAL_BUTTON_OK
        };

        this.popoverProvider.show(content);
        return;
      }

      if (selectedLocations.length === 0) {
        const content: PopoverContent = {
          type: Constants.POPOVER_INFO,
          title: Strings.GENERIC_MODAL_TITLE,
          message: Strings.HOT_DEAL_NO_LOCATION,
          positiveButtonText: Strings.MODAL_BUTTON_OK
        };

        this.popoverProvider.show(content);
        return;
      }


      this.hotDealItem.LOCATIONS = selectedLocations;
      this.setHotDealTotalPrice();
      this.navigatorService.push(OrderReviewPage, { hotDealItem: this.hotDealItem, orderTotal: this.orderTotal });

    }
  }

  public setHotDealTotalPrice(): void {
    let qty: number = 0;
    this.hotDealItem.LOCATIONS.forEach(location => {
      qty += location.QUANTITY;
    });
    this.orderTotal = this.pricingService.getPrice(qty, this.hotDealItem, this.hotDealItem.PROGRAM);
  }

  public add(location: LocationElement): void {
    location.QUANTITY = Number(location.QUANTITY) + 1;
    location.QUANTITY = this.pricingService.validateQuantity(location.QUANTITY, this.hotDealItem.PROGRAM, this.hotDealItem.ITEM);
  }

  public remove(location: LocationElement): void {
    location.QUANTITY = Number(location.QUANTITY) - 1;
    location.QUANTITY = this.pricingService.validateQuantity(location.QUANTITY, this.hotDealItem.PROGRAM, this.hotDealItem.ITEM);
  }

  public handleQuantityChange(location: LocationElement): void {
    location.QUANTITY = this.pricingService.validateQuantity(location.QUANTITY, this.hotDealItem.PROGRAM, this.hotDealItem.ITEM);
  }

  public PONumberValidation(location: LocationElement): void {
    if (!location.POSTOFFICE) {
      return;
    }

    if (location.POSTOFFICE.length > 15) {
      const content: PopoverContent = {
        type: Constants.POPOVER_INFO,
        title: Strings.GENERIC_MODAL_TITLE,
        message: Strings.PO_NUMBER_TOO_LONG,
        positiveButtonText: Strings.MODAL_BUTTON_OK
      };

      this.popoverProvider.show(content);
      location.POSTOFFICE = location.POSTOFFICE.substr(0, 15);
    }

    const initialLength: number = location.POSTOFFICE.length;
    location.POSTOFFICE = location.POSTOFFICE.replace(/[\W_]+/g, '');
    if (initialLength !== location.POSTOFFICE.length) {
      const content: PopoverContent = {
        type: Constants.POPOVER_INFO,
        title: Strings.GENERIC_MODAL_TITLE,
        message: Strings.PO_ALPHANUMERIC_WARNING,
        positiveButtonText: Strings.MODAL_BUTTON_OK
      };

      this.popoverProvider.show(content);
    }

  }

}
