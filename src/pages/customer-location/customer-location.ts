import {Component, OnInit, ViewChildren, QueryList, ElementRef} from '@angular/core';
import { NavParams, IonicFormInput} from 'ionic-angular';
import {CustomerLocation} from "../../interfaces/models/customer-location";
import {ShoppingListItem} from "../../interfaces/models/shopping-list-item";
import {UserInfoProvider} from "../../providers/user-info/user-info";
import {OrderReviewPage} from "../order-review/order-review";
import { NavigatorService } from '../../services/navigator/navigator';
import * as Constants from '../../util/constants';
import { LocationElement } from '../../interfaces/models/location-element';


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
  private isFlashDeal: boolean = false;
  private noLocation: boolean = false;


  constructor(private navigatorService: NavigatorService,
              private navParams: NavParams,
              private userInfoProvider: UserInfoProvider) {
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

    if(this.navParams.get('isFlashDeal')){
      this.isFlashDeal = this.navParams.get('isFlashDeal');
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
        //console.log(element);

        let locElement:LocationElement = {
          location: element,
          quantity: undefined,
          postOff: undefined
        };

        this.hotDealLocations.push(locElement);
      });


     // console.log(this.hotDealLocations,this.hotDealLocations);
     // this.hotDealLocations[1]["qty"]= 100;
     //this.hotDealLocations[0].quantity = this.orderTotal;
     // console.log("HOTDEALS:", this.hotDealLocations);

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

    if(this.isFlashDeal){
      let selectedLocations: Array<LocationElement> = [];

      this.hotDealLocations.forEach((element)=>{
        if(element["checked"])
        {

          if(!element.postOff || !element.quantity){
            let content = {
              
            }

          }
          selectedLocations.push({
            location: element.location,
            postOff: element.postOff,
            quantity: element.quantity
          });
        }
      });
      
     let params = {
        isFlashDeal: this.isFlashDeal,
        orderMethod: orderMethod,
        locations: selectedLocations,
        orderTotal: this.orderTotal
      };
      this.navigatorService.push(OrderReviewPage, params);
    }
  }
  
  add(location){
    location.quantity+=1;
  }

  remove(location){
    location.quantity-=1;
  }

}
