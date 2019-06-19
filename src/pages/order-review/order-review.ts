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
import { DatabaseOrder } from '../../interfaces/models/database-order';
import { ProductListInfo } from '../../interfaces/models/product-list-info';
import { getNavParam } from '../../util/validatedNavParams';
import { HotDealItem } from '../../interfaces/models/hot-deal-item';
import { HotDealConfirmation } from '../../interfaces/models/hot-deal-confirmation';

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
  private readonly confirmationNumbers: string[] = [];
  public isHotDeal: boolean = false;
  public hotLocations: LocationElement[];
  private hotDealItem: HotDealItem;

  constructor(private readonly navigatorService: NavigatorService,
              private readonly navParams: NavParams,
              private readonly shoppingListsProvider: ShoppingListsProvider,
              private readonly productProvider: ProductProvider) {}

  public ngOnInit(): void {
    this.orderMethod = getNavParam(this.navParams, 'orderMethod', 'number');
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

    if (this.shoppingListItems) {
    this.shoppingListItems.forEach(listItem => {
      this.shoppingListProgramNumbers [listItem.program_number] = listItem.program_number;
    });
  }

  }

  private getOrderQuery(programNumber: string, items: ShoppingListItem[]): string {
    let query: string = this.location.SHIPTONO + ':' + (this.postOffice ? this.postOffice : '') + ':' + programNumber + ':';
    items.forEach((item, index) => {
      query += item.product.SKU + '|' + item.quantity.toString() + (index < items.length - 1 ? ':' : '');
    });
    return query;
  }

  private getHotDealQuery(programNumber: string, item: Product, locations: LocationElement[]): any[] {
    const query: any[] = [];
    locations.forEach(location => {
      query.push({ order: location.LOCATION.SHIPTONO + ':' + (location.POSTOFFICE ? location.POSTOFFICE : '') + ':' + (programNumber ? programNumber : '') + ':' + item.SKU + '|' + location.QUANTITY.toString() });
    });
    return query;
  }

  public purchase(): void {
    Object.keys(this.shoppingListProgramNumbers).map((programNumber, index) => {
      const orderItems: ShoppingListItem[] = this.shoppingListItems.filter(item => item.program_number === programNumber);
      const itemsIds: number[] = orderItems.reduce((arr, item) => arr.concat(item.id), []);
      const productListInfo: ProductListInfo = {
        order_method: this.orderMethod,
        order_query: this.getOrderQuery(programNumber, orderItems)
      };
      const insertToDBInfo: DatabaseOrder = {
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
            const navigationParams: any = {
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

  public purchaseHotDeal(): void {

    const programNumber: string = this.hotDealItem.PROGRAM.PROGRAM_NO;
    const orderItem: Product = this.hotDealItem.ITEM;

    const productListInfo: any = {
      order_method: 2,
      order_query: this.getHotDealQuery(programNumber, orderItem, this.hotDealItem.LOCATIONS)
    };

    this.productProvider.orderHotDeal(productListInfo).then((data: any) => {
      const confirmations: HotDealConfirmation[] = [];


      JSON.parse(data.d).forEach((result: HotDealConfirmation) => {
        confirmations.push(result);
      });

      const navigationParams: any = {
        orderTotal: this.orderTotal,
        orderMethod: this.orderMethod,
        hotDealConfirmations: confirmations,
        hotDealLocations: this.hotDealItem.LOCATIONS,
        hotDealPurchase: true
      };

      this.navigatorService.push(OrderConfirmationPage, navigationParams).catch(err => console.error(err));


    }).catch(err => console.error(err));
  }


  public cancel(): void {
    this.navigatorService.pop().catch(err => console.error(err));
  }


}
