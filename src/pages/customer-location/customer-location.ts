import {Component, OnInit, ViewChildren, QueryList, ElementRef} from '@angular/core';
import { NavParams, IonicFormInput} from 'ionic-angular';
import {CustomerLocation} from "../../interfaces/models/customer-location";
import {ShoppingListItem} from "../../interfaces/models/shopping-list-item";
import {UserInfoProvider} from "../../providers/user-info/user-info";
import {OrderReviewPage} from "../order-review/order-review";
import { NavigatorService } from '../../services/navigator/navigator';
import * as Constants from '../../util/constants';
import * as Strings from '../../util/strings';
import { LocationElement } from '../../interfaces/models/location-element';
import { PopoversProvider } from '../../providers/popovers/popovers';


@Component({
  selector: 'page-customer-location',
  templateUrl: 'customer-location.html',
})
export class CustomerLocationPage implements OnInit {
  public readonly sendToOrgillMethod: number = 1;
  public readonly checkoutMethod: number = 2;

  public postOffice: string;
  public userLocations: Array<CustomerLocation> = [];
  public selectedLocation: CustomerLocation;
  public hotDealLocations: LocationElement[] = [];
  public postOffices: Array<number>;
  

  private shoppingListId: number;
  private shoppingListItems: Array<ShoppingListItem> = [];
  private orderTotal: number;
  private isHotDeal: boolean = false;
  private noLocation: boolean = false;
  private hotDealItem: any;

  constructor(private navigatorService: NavigatorService,
              private navParams: NavParams,
              private userInfoProvider: UserInfoProvider,
              private popoverProvider: PopoversProvider) {
  }

  ngOnInit(): void {
    if (this.navParams.get('shoppingListId')) {
      this.shoppingListId = this.navParams.get('shoppingListId');
    }
    if (this.navParams.get('shoppingListItems')) {
      this.shoppingListItems = this.navParams.get('shoppingListItems');
    }
    if (this.navParams.get('orderTotal')) {
      this.orderTotal = this.navParams.get('orderTotal');
    }

    if(this.navParams.get('hotDeal')){
      this.isHotDeal = true;
      this.hotDealItem = this.navParams.get('hotDeal');
    }


    this.userInfoProvider.getUserLocations().subscribe((locations) => {
     

      if (Constants.DEBUG_NO_LOCATIONS) {
        locations = null; //HACK: TESTING
      }

      if (!locations) {
        this.noLocation = true;
        return;
      }


      this.userLocations = this.sortLocations(JSON.parse(locations.d));
      if (this.userLocations.length > 0) {
        this.selectedLocation = this.userLocations[0];
      }

      this.userLocations.forEach((element) => {

        let locElement : LocationElement = {
          LOCATION: element,
          POSTOFFICE: undefined,
          QUANTITY: undefined,
          WANTED:false
        };

        this.hotDealLocations.push(locElement);
      });

    })
  }


  sortLocations(responseData) {
    return responseData.sort((location1, location2): number => {
      return location1.CUSTOMERNAME.toLowerCase().localeCompare(location2.CUSTOMERNAME.toLowerCase());
    });
  }

  sendToOrgill() {
    this.redirectToOrderReview(this.sendToOrgillMethod);
  }

  checkout() {
    this.redirectToOrderReview(this.checkoutMethod);
  }

  redirectToOrderReview(orderMethod: number) {
    if (this.shoppingListId) {
      let params = {
        orderMethod: orderMethod,
        postOffice: this.postOffice,
        location: this.selectedLocation,
        shoppingListId: this.shoppingListId,
        shoppingListItems: this.shoppingListItems,
        orderTotal: this.orderTotal
      };
      this.navigatorService.push(OrderReviewPage, params);
    }

    if(this.isHotDeal){
      let selectedLocations: Array<LocationElement> = [];

      let valid = true;

      this.hotDealLocations.forEach((element)=>{
        if(element.WANTED)
        {

          if(!element.POSTOFFICE|| !element.QUANTITY){
            valid=false;
          }

          selectedLocations.push(element);
        }
      });

      if(!valid)
      {
        let content = {
          type: Constants.POPOVER_INFO,
          title: Strings.GENERIC_MODAL_TITLE,
          message: Strings.HOT_DEAL_LOCATION_INVALID,
          positiveButtonText: Strings.MODAL_BUTTON_OK,
        }

        this.popoverProvider.show(content);
        return;
      }

      if(selectedLocations.length==0){
        let content = {
          type: Constants.POPOVER_INFO,
          title: Strings.GENERIC_MODAL_TITLE,
          message: Strings.HOT_DEAL_NO_LOCATION,
          positiveButtonText: Strings.MODAL_BUTTON_OK,
        }

        this.popoverProvider.show(content);
        return;
      }
      
      
      this.hotDealItem.LOCATIONS = selectedLocations;
      this.navigatorService.push(OrderReviewPage, {hotDeal:this.hotDealItem});
    }
  }
  
  add(location){
    location.quantity+=1;
  }

  remove(location){
    location.quantity-=1;
  }

}
