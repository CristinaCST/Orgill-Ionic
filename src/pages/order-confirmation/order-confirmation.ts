import { Component, OnInit } from '@angular/core';
import { NavParams } from 'ionic-angular';
import { ShoppingListsProvider } from '../../providers/shopping-lists/shopping-lists';
import { NavigatorService } from '../../services/navigator/navigator';
import { Catalog } from '../../pages/catalog/catalog';
import { HotDealService } from '../../services/hotdeal/hotdeal';
import { getNavParam } from '../../helpers/validatedNavParams';
import { HotDealConfirmation } from '../../interfaces/models/hot-deal-confirmation';
import { LocationElement } from '../../interfaces/models/location-element';


@Component({
  selector: 'page-order-confirmation',
  templateUrl: 'order-confirmation.html'
})
export class OrderConfirmationPage implements OnInit {

  public confirmationNumbers: string[];
  public orderTotal: number;
  public orderMethod: number;
  public confirmation: string;
  private hotDealPurchase: boolean = false;
  private hotDealLocations: LocationElement[];
  private hotDealConfirmations: HotDealConfirmation[];

  constructor(
    private readonly navParams: NavParams,
    private readonly shoppingListsProvider: ShoppingListsProvider,
    private readonly navigatorService: NavigatorService,
    private readonly hotDealService: HotDealService) {
  }

  public ngOnInit(): void {
    this.confirmationNumbers = getNavParam(this.navParams, 'confirmationNumbers', 'object');
    this.orderTotal = getNavParam(this.navParams, 'orderTotal', 'number');
    this.orderMethod = getNavParam(this.navParams, 'orderMethod', 'number');
    this.hotDealPurchase = getNavParam(this.navParams, 'hotDealPurchase', 'boolean');
    if (this.hotDealPurchase) {
      this.hotDealLocations = getNavParam(this.navParams, 'hotDealLocations', 'object');
      this.hotDealConfirmations = getNavParam(this.navParams, 'hotDealConfirmations', 'object');
    }
    this.getOrderConfirmation();
    this.navigatorService.oneTimeBackButtonOverride(() => {this.navigatorService.setRoot(Catalog); });
  }

  private getConfirmationNumbersQuery(): string {
    let query: string = '';
    this.confirmationNumbers.map((confirmationNumber, index) => {
      query += confirmationNumber + (index < this.confirmationNumbers.length - 1 ? ',' : '');
    });
    return query;
  }

  public getOrderConfirmation(): void {
    if (!this.hotDealPurchase) {
      this.shoppingListsProvider.getOrderConfirmation(this.getConfirmationNumbersQuery()).subscribe(data => {
        if (data) {
          if (JSON.parse(data.d).order_confirmation.match(/\d+/g) !== null) {
            this.confirmation = JSON.parse(data.d).order_confirmation;
          }
        }
      });
    } else {
      if (this.hotDealConfirmations) {
        let expired: boolean = false;
     //   this.hotDealConfirmations[1].quantity -= 1;
        this.hotDealConfirmations.forEach((confirmation, index) => {
          const pairingLocation: LocationElement = this.hotDealLocations.find(location => location.LOCATION.SHIPTONO === confirmation.customer_number);
          this.hotDealConfirmations[index].fullLocation = pairingLocation;
          if (pairingLocation.QUANTITY > confirmation.quantity) {
            expired = true;
          }
        });

        if (expired) {
          this.hotDealService.markHotDealExpired();
        }

        this.confirmation = '';
        this.hotDealConfirmations.forEach(confirmation => {

          this.confirmation += 'Confirmation for location ' + confirmation.fullLocation.LOCATION.ADDRESS + ' with confirmation number (' + confirmation.confirmation + ') and quantity (' + confirmation.quantity.toString() + ') ' + '<br>';
        });
      }
    }
  }

}
