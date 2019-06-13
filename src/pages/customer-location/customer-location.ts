import { Component, OnInit, ViewChildren } from '@angular/core';
import { NavParams } from 'ionic-angular';
import { CustomerLocation } from '../../interfaces/models/customer-location';
import { ShoppingListItem } from '../../interfaces/models/shopping-list-item';
import { UserInfoService } from '../../services/user-info/user-info';
import { OrderReviewPage } from '../order-review/order-review';
import { NavigatorService } from '../../services/navigator/navigator';
import * as Constants from '../../util/constants';
import * as Strings from '../../util/strings';
import { LocationElement } from '../../interfaces/models/location-element';
import { PopoversService } from '../../services/popovers/popovers';
import { PricingService } from '../../services/pricing/pricing';


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

  constructor(private navigatorService: NavigatorService,
              private navParams: NavParams,
              private userInfoProvider: UserInfoService,
              private popoverProvider: PopoversService,
              private pricingService: PricingService) {
  }

  public ngOnInit(): void {
    if (this.navParams.get('shoppingListId')) {
      this.shoppingListId = this.navParams.get('shoppingListId');
    }
    if (this.navParams.get('shoppingListItems')) {
      this.shoppingListItems = this.navParams.get('shoppingListItems');
    }
    if (this.navParams.get('orderTotal')) {
      this.orderTotal = this.navParams.get('orderTotal');
    }

    if (this.navParams.get('hotDeal')) {
      this.isHotDeal = true;
      this.hotDealItem = this.navParams.get('hotDeal');
    }


    this.userInfoProvider.getUserLocations().subscribe(locations => {

      if (Constants.DEBUG_NO_LOCATIONS) {
        locations = undefined;
      }

      if (!locations) {
        this.noLocation = true;
        return;
      }


      this.userLocations = this.sortLocations(JSON.parse(locations.d));
      if (this.userLocations.length > 0) {
        this.selectedLocation = this.userLocations[0];
      }

      const min_value = this.isHotDeal ? this.pricingService.validateQuantity(1, this.hotDealItem.PROGRAM, this.hotDealItem.ITEM, true) : 1;

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


  public sortLocations(responseData) {
    return responseData.sort((location1, location2): number => {
      return location1.CUSTOMERNAME.toLowerCase().localeCompare(location2.CUSTOMERNAME.toLowerCase());
    });
  }

  public sendToOrgill() {
    this.redirectToOrderReview(this.sendToOrgillMethod);
  }

  public checkout() {
    this.redirectToOrderReview(this.checkoutMethod);
  }

  public redirectToOrderReview(orderMethod: number) {
    if (this.shoppingListId != undefined) {
      const params = {
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

      let valid = true;

      this.hotDealLocations.forEach(element => {
        if (element.WANTED) {

          if (element.QUANTITY == undefined || element.QUANTITY === 0) {
            valid = false;
          }

          selectedLocations.push(element);
        }
      });

      if (!valid) {
        const content = {
          type: Constants.POPOVER_INFO,
          title: Strings.GENERIC_MODAL_TITLE,
          message: Strings.HOT_DEAL_LOCATION_INVALID,
          positiveButtonText: Strings.MODAL_BUTTON_OK
        };

        this.popoverProvider.show(content);
        return;
      }

      if (selectedLocations.length === 0) {
        const content = {
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

  public setHotDealTotalPrice() {
    let qty = 0;
    this.hotDealItem.LOCATIONS.forEach(location => {
      qty += location.QUANTITY;
    });
    this.orderTotal =  this.pricingService.getPrice(qty, this.hotDealItem, this.hotDealItem.PROGRAM);
  }

  public add(location) {
    location.QUANTITY = Number(location.QUANTITY) + 1;
    location.QUANTITY =  this.pricingService.validateQuantity(location.QUANTITY, this.hotDealItem.PROGRAM, this.hotDealItem.ITEM);
  }

  public remove(location) {
    location.QUANTITY = Number(location.QUANTITY) - 1;
    location.QUANTITY = this.pricingService.validateQuantity(location.QUANTITY, this.hotDealItem.PROGRAM, this.hotDealItem.ITEM);
  }

  public handleQuantityChange(location) {
    location.QUANTITY = this.pricingService.validateQuantity(location.QUANTITY, this.hotDealItem.PROGRAM, this.hotDealItem.ITEM);
  }

  public PONumberValidation(location) {
    if (!location.POSTOFFICE) {
      return;
    }

    if (location.POSTOFFICE.length > 15) {
      const content = {
        type: Constants.POPOVER_INFO,
        title: Strings.GENERIC_MODAL_TITLE,
        message: Strings.PO_NUMBER_TOO_LONG,
        positiveButtonText: Strings.MODAL_BUTTON_OK
      };

      this.popoverProvider.show(content);
      location.POSTOFFICE = location.POSTOFFICE.substr(0, 15);
    }

    const initialLength = location.POSTOFFICE.length;
    location.POSTOFFICE = location.POSTOFFICE.replace(/[\W_]+/g, '');
    if (initialLength !== location.POSTOFFICE.length) {
      const content = {
        type: Constants.POPOVER_INFO,
        title: Strings.GENERIC_MODAL_TITLE,
        message: Strings.PO_ALPHANUMERIC_WARNING,
        positiveButtonText: Strings.MODAL_BUTTON_OK
      };

      this.popoverProvider.show(content);
    }

  }

}
