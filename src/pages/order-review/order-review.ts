import { Component, OnInit } from '@angular/core';
import { NavParams } from 'ionic-angular';
import { CustomerLocation } from '../../interfaces/models/customer-location';
import { ShoppingListsProvider } from '../../providers/shopping-lists/shopping-lists';
import { ShoppingListItem } from '../../interfaces/models/shopping-list-item';
import moment from 'moment';
import { OrderConfirmationPage } from '../order-confirmation/order-confirmation';
import { NavigatorService } from '../../services/navigator/navigator';
import { LocationElement } from '../../interfaces/models/location-element';
import { Product } from '../../interfaces/models/product';
import { ProductProvider } from '../../providers/product/product';

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
  private shoppingListProgramNumbers: string[] = [];
  private confirmationNumbers: string[] = [];
  public isHotDeal: boolean = false;
  public hotLocations: LocationElement[];
  private hotDealItem: any;

  constructor(private navigatorService: NavigatorService,
              private navParams: NavParams,
              private shoppingListsProvider: ShoppingListsProvider,
              private productProvider: ProductProvider) {}

  public ngOnInit(): void {
    this.orderMethod = this.checkValidParams('orderMethod');
    this.postOffice = this.checkValidParams('postOffice');
    this.location = this.checkValidParams('location');
    this.shoppingListId = this.checkValidParams('shoppingListId');
    this.shoppingListItems = this.checkValidParams('shoppingListItems');
    this.orderTotal = this.checkValidParams('orderTotal');
    this.isHotDeal = this.checkValidParams('isHotDeal');
    this.hotDealItem = this.checkValidParams('hotDealItem');

    if (this.hotDealItem) {
      this.isHotDeal = true;

      this.hotLocations = this.hotDealItem.LOCATIONS;
    }

    if (this.shoppingListItems) {
    this.shoppingListItems.forEach(listItem => {
      this.shoppingListProgramNumbers [listItem.program_number] = listItem.program_number;
    });
  }

  }

  public checkValidParams(type) {
    if (this.navParams.get(type)) {
      return this.navParams.get(type);
    }
  }

  private getOrderQuery(programNumber: string, items: ShoppingListItem[]): string {
    let query = this.location.SHIPTONO + ':' + (this.postOffice ? this.postOffice : '') + ':' + programNumber + ':';
    items.forEach((item, index) => {
      query += item.product.SKU + '|' + item.quantity + (index < items.length - 1 ? ':' : '');
    });
    return query;
  }

  private getHotDealQuery(programNumber: string, item: Product, locations: LocationElement[]) {
    const query = [];
    locations.forEach(location => {
      query.push({ order: location.LOCATION.SHIPTONO + ':' + (location.POSTOFFICE ? location.POSTOFFICE : '') + ':' + (programNumber ? programNumber : '') + ':' + item.SKU + '|' + location.QUANTITY });
    });
    return query;
  }

  public purchase() {
    Object.keys(this.shoppingListProgramNumbers).map((programNumber, index) => {
      const orderItems = this.shoppingListItems.filter(item => item.program_number === programNumber);
      const itemsIds = orderItems.reduce((arr, item) => arr.concat(item.id), []);
      const productListInfo = {
        order_method: this.orderMethod,
        order_query: this.getOrderQuery(programNumber, orderItems)
      };
      const insertToDBInfo = {
        PO: this.postOffice,
        date: moment().format('MM/DD/YYYY'),
        location: this.location.SHIPTONO,
        type: this.orderMethod,
        total: this.orderTotal,
        program_number: programNumber
      };
      this.shoppingListsProvider.orderProducts(productListInfo, insertToDBInfo, itemsIds, this.shoppingListId).then((data: any) => {
        if (data.insertedPurchaseToDBInfo.insertId) {
          this.confirmationNumbers.push(data.confirmationNumber);
          if (index === Object.keys(this.shoppingListProgramNumbers).length - 1) {
            const navigationParams = {
              confirmationNumbers: this.confirmationNumbers,
              orderTotal: this.orderTotal,
              orderMethod: this.orderMethod
            };
            this.navigatorService.push(OrderConfirmationPage, navigationParams).catch(err => console.error(err));
          }
        }
      }).catch(err => console.error(err));
    });
  }

  public purchaseHotDeal() {

    const programNumber = this.hotDealItem.PROGRAM.PROGRAMNO;
    const orderItem = this.hotDealItem.ITEM;

    const productListInfo = {
      order_method: 2,
      order_query: this.getHotDealQuery(programNumber, orderItem, this.hotDealItem.LOCATIONS)
    };

    this.productProvider.orderHotDeal(productListInfo).then((data: any) => {
      const confirmations = [];
      data = JSON.parse(data.d).forEach(result => {
        confirmations.push(result);
      });

      const navigationParams = {
        orderTotal: this.orderTotal,
        orderMethod: this.orderMethod,
        hotDealConfirmations: confirmations,
        hotDealLocations: this.hotDealItem.LOCATIONS,
        hotDealPurchase: true
      };

      this.navigatorService.push(OrderConfirmationPage, navigationParams).catch(err => console.error(err));


    }).catch(err => console.error(err));
  }


  public cancel() {
    this.navigatorService.pop().catch(err => console.error(err));
  }


}
