import { Component, OnInit, ViewChildren } from '@angular/core';
import { NavParams, Keyboard, Events, Checkbox } from 'ionic-angular';
import { CustomerLocation } from '../../interfaces/models/customer-location';
import { ShoppingListItem } from '../../interfaces/models/shopping-list-item';
import { UserInfoService } from '../../services/user-info/user-info';
import { OrderReviewPage } from '../order-review/order-review';
import { NavigatorService } from '../../services/navigator/navigator';
import * as Constants from '../../util/constants';
import * as Strings from '../../util/strings';
import { LocationElement } from '../../interfaces/models/location-element';
import { PopoversService, PopoverContent, QuantityPopoverResult } from '../../services/popovers/popovers';
import { PricingService } from '../../services/pricing/pricing';
import { getNavParam } from '../../helpers/validatedNavParams';
import { PONumberValidator } from '../../validators/PONumber';
import { HotDealItem } from 'interfaces/models/hot-deal-item';


@Component({
  selector: 'page-customer-location',
  templateUrl: 'customer-location.html'
})
export class CustomerLocationPage implements OnInit {


  @ViewChildren('QTYinput') public QuantityInput: string;

  public readonly sendToOrgillMethod: number = Constants.SEND_TO_ORGILL_METHOD;
  public readonly checkoutMethod: number = Constants.CHECKOUT_METHOD;

  public postOffice: string;
  public userLocations: CustomerLocation[] = [];
  public selectedLocation: CustomerLocation;
  public hotDealLocations: LocationElement[] = [];
  public postOffices: number[];
  public fullSelection: boolean = false;


  private shoppingListId: number;
  private shoppingListItems: ShoppingListItem[] = [];
  private orderTotal: number;
  private isHotDeal: boolean = false;
  public noLocation: boolean = false;
  private hotDealItem: HotDealItem;

  constructor(private readonly navigatorService: NavigatorService,
              private readonly navParams: NavParams,
              private readonly userInfoProvider: UserInfoService,
              private readonly popoversService: PopoversService,
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
      if (!locations) {
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

  public sortLocations(locations: CustomerLocation[]): CustomerLocation[] {
    return locations.sort((location1, location2): number => {
      return location1.CUSTOMERNAME.toLowerCase().localeCompare(location2.CUSTOMERNAME.toLowerCase());
    });
  }

  public sendToOrgill(): void {
    this.redirectToOrderReview(this.sendToOrgillMethod);
  }

  public checkout(): void {
    if (!this.noLocation) {
      this.redirectToOrderReview(this.checkoutMethod);
    } else {
      const content: PopoverContent = this.popoversService.setContent(Strings.GENERIC_MODAL_TITLE, Strings.NO_CUSTOMER_LOCATION);
      this.popoversService.show(content);
    }
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
      
      if (!this.postOffice && this.selectedLocation.PO_REQUIRED === 'Y') {
        const content: PopoverContent = {
          type: Constants.POPOVER_INFO,
          title: Strings.GENERIC_MODAL_TITLE,
          message: Strings.PO_MISSING_REQUIRED,
          positiveButtonText: Strings.MODAL_BUTTON_OK
        };
        this.popoversService.show(content);
        return;
      }

      this.navigatorService.push(OrderReviewPage, params);
    }

    if (this.isHotDeal) {
      const selectedLocations: LocationElement[] = [];

      let validQty: boolean = true;
      let validPO: boolean = true;

      this.hotDealLocations.forEach(element => {
        if (element.WANTED) {

          if (element.QUANTITY == undefined || element.QUANTITY === 0) {
            validQty = false;
          }

          if (element.LOCATION.PO_REQUIRED === 'Y' && !element.POSTOFFICE)
          {
            validPO = false;
          }
          selectedLocations.push(element);
        }
      });

      if (!validQty) {
        const content: PopoverContent = {
          type: Constants.POPOVER_INFO,
          title: Strings.GENERIC_MODAL_TITLE,
          message: Strings.HOT_DEAL_LOCATION_QUANTITY_INVALID,
          positiveButtonText: Strings.MODAL_BUTTON_OK
        };

        this.popoversService.show(content);
        return;
      }

      if (!validPO) {
        const content: PopoverContent = {
          type: Constants.POPOVER_INFO,
          title: Strings.GENERIC_MODAL_TITLE,
          message: Strings.HOT_DEAL_LOCATION_PO_INVALID,
          positiveButtonText: Strings.MODAL_BUTTON_OK
        };
        this.popoversService.show(content);
        return;
      }

      if (selectedLocations.length === 0) {
        const content: PopoverContent = {
          type: Constants.POPOVER_INFO,
          title: Strings.GENERIC_MODAL_TITLE,
          message: Strings.HOT_DEAL_NO_LOCATION,
          positiveButtonText: Strings.MODAL_BUTTON_OK
        };

        this.popoversService.show(content);
        return;
      }


      this.hotDealItem.LOCATIONS = selectedLocations;
      this.setHotDealTotalPrice();
      this.navigatorService.push(OrderReviewPage, { orderMethod, hotDealItem: this.hotDealItem, orderTotal: this.orderTotal });

    }
  }
  
  public setHotDealTotalPrice(): void {
    let qty: number = 0;
    this.hotDealItem.LOCATIONS.forEach(location => {
      qty += location.QUANTITY;
    });
    this.orderTotal = this.pricingService.getPrice(qty, this.hotDealItem.ITEM, this.hotDealItem.PROGRAM);
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

  public PONumberValidation(location?: LocationElement): void {
    if (location) {
      location.POSTOFFICE = PONumberValidator(location.POSTOFFICE, this.popoversService);
    } else {
      this.postOffice = PONumberValidator(this.postOffice, this.popoversService);
    }
  }

  public selectAll(): void {
    if (!this.isHotDeal) {
      return;
    }
    const status: boolean = this.fullSelection ? false : true;
    this.hotDealLocations.forEach(location => {
      location.WANTED = status;
    });
    this.fullSelection = !this.fullSelection;
  }

  public fillQuantity(): void {
    const additionalData: any = { minqty: this.hotDealItem.PROGRAM.MINQTY, maxqty: this.hotDealItem.PROGRAM.MAXQTY, shelfpack: this.hotDealItem.ITEM.QTY_ROUND_OPTION === 'X' ? this.hotDealItem.ITEM.SHELF_PACK : 1 };
    const content: PopoverContent = this.popoversService.setContent(Strings.GENERIC_MODAL_TITLE, Strings.LOCATIONS_QUANTITY_MODAL_DESCRIPTION, Strings.MODAL_BUTTON_OK, Strings.MODAL_BUTTON_CANCEL, undefined, Constants.POPOVER_FILL_QUANTITY, additionalData);
    this.popoversService.show(content).subscribe((result: QuantityPopoverResult) => {
      if (result.optionSelected !== 'OK') {
        return;
      }
      this.hotDealLocations.forEach(location => {
        location.QUANTITY = this.pricingService.validateQuantity(result.quantity, this.hotDealItem.PROGRAM, this.hotDealItem.ITEM);
      });
    });
  }

  public checkboxEvent($ev: Checkbox, loc: LocationElement): void {
    loc.WANTED = $ev.checked;
    if (!$ev.checked) {
      this.fullSelection = false;
    } else {
      let full: boolean = true;
      this.hotDealLocations.forEach(location => {
        if (!location.WANTED) {
          full = false;
        }
      });
      this.fullSelection = full;
    }
  }
  
}
