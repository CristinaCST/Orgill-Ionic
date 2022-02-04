import { Component, OnDestroy, OnInit } from '@angular/core';
import { Events, NavController, NavParams } from 'ionic-angular';
import { DropshipProvider } from '../../providers/dropship/dropship';
import { Subscription } from 'rxjs';
import { FormDetails, FormItems } from '../../interfaces/response-body/dropship';
import { DropshipService } from '../../services/dropship/dropship';

@Component({
  selector: 'page-checkout',
  templateUrl: 'checkout.html'
})
export class CheckoutPage implements OnInit, OnDestroy {
  public checkoutItems: FormDetails[] | FormItems[];
  private subscription: Subscription;

  constructor(
    public events: Events,
    public navController: NavController,
    private readonly navParams: NavParams,
    private readonly dropshipService: DropshipService,
    private readonly dropshipProvider: DropshipProvider
  ) {
    events.subscribe('searchItems:checkout', (searchItems: FormItems[]) => {
      if (!searchItems && !Boolean(searchItems.length)) {
        return;
      }

      this.getSpecialMinimumOrder(searchItems);
    });
  }

  get form_id(): number {
    return this.navParams.get('form_id') || this.checkoutItems[0].form_id;
  }

  public ngOnInit(): void {
    this.subscription = this.dropshipService.checkoutItemsObservable.subscribe(result => {
      this.checkoutItems = result;
    });

    const searchItems: FormItems[] = this.navParams.get('searchItems');
    if (searchItems) {
      this.getSpecialMinimumOrder(searchItems);
    }
  }

  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.events.unsubscribe('searchItems:checkout');
  }

  public goBack(): void {
    this.navController.pop();
  }

  public handleSearch(keyword: string): void {
    this.dropshipService.searchFormItem(keyword, this.form_id, true);
  }

  public handleScan(): void {
    this.dropshipService.scanFormItem(this.form_id, true);
  }

  public pushSearchItemsIntoCart(cartItems: FormItems[]): void {
    this.dropshipService.resetCart(cartItems);
  }

  public getSpecialMinimumOrder(searchItems: FormItems[]): void {
    const cartItems: any = [...this.checkoutItems, ...searchItems];

    this.dropshipProvider.getFormDetails({ form_id: this.form_id }).subscribe(response => {
      const formDetails: FormDetails = JSON.parse(response.d);

      this.pushSearchItemsIntoCart(
        cartItems.map(item => {
          item.special_minimum_order = formDetails.special_minimum_order;
          return item;
        })
      );
    });
  }
}
