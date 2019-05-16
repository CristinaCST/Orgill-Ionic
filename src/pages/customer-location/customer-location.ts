import {Component, OnInit, ViewChildren, QueryList, ElementRef} from '@angular/core';
import { NavParams, IonicFormInput} from 'ionic-angular';
import {CustomerLocation} from "../../interfaces/models/customer-location";
import {ShoppingListItem} from "../../interfaces/models/shopping-list-item";
import {UserInfoProvider} from "../../providers/user-info/user-info";
import {OrderReviewPage} from "../order-review/order-review";
import { NavigatorService } from '../../services/navigator/navigator';
import { pointerCoord } from 'ionic-angular/umd/util/dom';


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
  public hotDealLocations: Object[] = [];
  public postOffices: Array<number>;

  private shoppingListId: number;
  private shoppingListItems: Array<ShoppingListItem> = [];
  private orderTotal: number;
  private isFlashDeal: boolean = false;


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
      if (!locations) {
        return;
      }


      this.userLocations = this.sortLocations(JSON.parse(locations.d));
      if (this.userLocations.length > 0) {
        this.selectedLocation = this.userLocations[0];

  
      }

      this.userLocations.forEach((element) => {
        console.log(element);
        this.hotDealLocations.push({
          location: element,
          postOffices: 0,
          qty: 0,
        });
      });
      this.hotDealLocations[1]["qty"]= 100;
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
  }
}
