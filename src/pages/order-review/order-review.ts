import {Component, OnInit} from '@angular/core';
import {NavController, NavParams} from "ionic-angular";
import {CustomerLocation} from "../../interfaces/models/customer-location";
import {ShoppingListsProvider} from "../../providers/shopping-lists/shopping-lists";
import {ShoppingListItem} from "../../interfaces/models/shopping-list-item";
import moment from 'moment';
import {OrderConfirmationPage} from "../order-confirmation/order-confirmation";

@Component({
  selector: 'page-order-review',
  templateUrl: 'order-review.html',
})
export class OrderReviewPage implements OnInit {

  public orderMethod;
  public postOffice = '-';
  public location: CustomerLocation;
  public shoppingListId;
  public shoppingListItems;
  public orderTotal;
  private shoppingListProgramNumbers: Array<string> = [];
  private confirmationNumbers: Array<string> = [];

  constructor(private navController: NavController, private navParams: NavParams,
              private shoppingListsProvider: ShoppingListsProvider) {
  }

  ngOnInit(): void {
    this.orderMethod = this.checkValidParams('orderMethod');
     this.postOffice = this.checkValidParams('postOffice');
    this.location = this.checkValidParams('location');
    this.shoppingListId = this.checkValidParams('shoppingListId');
    this.shoppingListItems = this.checkValidParams('shoppingListItems');
    this.orderTotal = this.checkValidParams('orderTotal');

    this.shoppingListItems.forEach(listItem => {
      this.shoppingListProgramNumbers [listItem.program_number] = listItem.program_number;
    });
  }

  checkValidParams(type) {
    if (this.navParams.get(type)) {
      return this.navParams.get(type);
    }
  }

  private getOrderQuery(programNumber: string, items: Array<ShoppingListItem>): string {
    let query = this.location.SHIPTONO + ":" + (this.postOffice ? this.postOffice : "") + ":" + programNumber + ":";
    items.forEach((item, index) => {
      query += item.product.SKU + "|" + item.quantity + (index < items.length - 1 ? ":" : "");
    });
    return query;
  }

  purchase() {
    Object.keys(this.shoppingListProgramNumbers).map((programNumber, index) => {
      let orderItems = this.shoppingListItems.filter(item => item.program_number == programNumber);
      let itemsIds = orderItems.reduce((arr, item) => arr.concat(item.id), []);
      let productListInfo = {
        order_method: this.orderMethod,
        order_query: this.getOrderQuery(programNumber, orderItems)
      };
      let insertToDBInfo = {
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
            let navigationParams = {
              confirmationNumbers: this.confirmationNumbers,
              orderTotal: this.orderTotal,
              orderMethod: this.orderMethod
            };
            this.navController.push(OrderConfirmationPage, navigationParams).catch(err => console.error(err));
          }
        }
      }).catch(err => console.error(err));
    });
  }

  cancel() {
    this.navController.pop().catch(err => console.error(err));
  }

}
