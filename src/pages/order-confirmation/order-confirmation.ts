import {Component, OnInit} from '@angular/core';
import {NavParams} from 'ionic-angular';
import {ShoppingListsProvider} from "../../providers/shopping-lists/shopping-lists";
import { NavigatorService } from '../../services/navigator/navigator';
import { Catalog } from '../../pages/catalog/catalog';


@Component({
  selector: 'page-order-confirmation',
  templateUrl: 'order-confirmation.html',
})
export class OrderConfirmationPage implements OnInit {

  public confirmationNumbers;
  public orderTotal;
  public orderMethod;
  public confirmation;

  constructor(private navParams: NavParams, private shoppingListsProvider: ShoppingListsProvider, private navigatorService: NavigatorService) {
  }

  ngOnInit(): void {
    this.confirmationNumbers = this.checkValidParams('confirmationNumbers');
    this.orderTotal = this.checkValidParams('orderTotal');
    this.orderMethod = this.checkValidParams('orderMethod');
    this.getOrderConfirmation();
    this.navigatorService.oneTimeBackButtonOverride(()=>{this.navigatorService.setRoot(Catalog)});
  }

  checkValidParams(type) {
    if (this.navParams.get(type)) {
      return this.navParams.get(type);
    }
  }

  private getConfirmationNumbersQuery(): string {
    let query: string = '';
    this.confirmationNumbers.map((number, index) => {
      query += number + (index < this.confirmationNumbers.length - 1 ? ',' : '');
    });
    return query;
  }

  getOrderConfirmation() {
    this.shoppingListsProvider.getOrderConfirmation(this.getConfirmationNumbersQuery()).subscribe((data) => {
      if (data) {
        if (JSON.parse(data.d).order_confirmation.match(/\d+/g) !== null) {
          this.confirmation = JSON.parse(data.d).order_confirmation;
        }
      }
    })
  }

}
