import { Component, OnDestroy, OnInit } from '@angular/core';
import { Events, NavController, NavParams } from 'ionic-angular';
import { DropshipProvider } from '../../providers/dropship/dropship';
import { Subscription } from 'rxjs';
import { FormDetails, FormItems } from '../../interfaces/response-body/dropship';
import { DropshipService } from '../../services/dropship/dropship';
import { PopoverContent, PopoversService } from '../../services/popovers/popovers';
import * as Constants from '../../util/constants';
import * as Strings from '../../util/strings';

@Component({
  selector: 'page-checkout',
  templateUrl: 'checkout.html'
})
export class CheckoutPage implements OnInit, OnDestroy {
  public checkoutItems: FormDetails[] | FormItems[];
  private subscription: Subscription;
  public popoverContent: PopoverContent = {
    type: Constants.POPOVER_INFO,
    title: Strings.GENERIC_MODAL_TITLE,
    message: Strings.dropship_item_added,
    positiveButtonText: Strings.MODAL_BUTTON_OK
  };

  constructor(
    public events: Events,
    public navController: NavController,
    private readonly navParams: NavParams,
    private readonly dropshipService: DropshipService,
    private readonly dropshipProvider: DropshipProvider,
    private readonly popoversService: PopoversService
  ) {
    events.subscribe('searchItems:checkout', (searchItems: FormItems[]) => {
      if (!searchItems && !Boolean(searchItems.length)) {
        return;
      }

      this.getSpecialMinimumOrder(searchItems);
    });
  }

  get form_id(): number {
    if (this.navParams.get('form_id')) {
      return this.navParams.get('form_id');
    }

    return this.checkoutItems[0].form_id;
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

  public handleScan(): void {
    this.dropshipService.scanFormItem(this.form_id, true);
  }

  public pushSearchItemsIntoCart(cartItems: FormItems[]): void {
    this.dropshipService.resetCart(cartItems);
    this.popoversService.show(this.popoverContent);
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
