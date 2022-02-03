import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavController } from 'ionic-angular';
import { Subscription } from 'rxjs';
import { SelectSpecialsPage } from '../../pages/ds-select-specials/select-specials';
import { FormDetails, FormItems } from '../../interfaces/response-body/dropship';
import { DropshipService } from '../../services/dropship/dropship';

@Component({
  selector: 'page-checkout',
  templateUrl: 'checkout.html'
})
export class CheckoutPage implements OnInit, OnDestroy {
  public checkoutItems: FormDetails | FormItems;
  public subscription: Subscription;

  constructor(private readonly dropshipService: DropshipService, public navController: NavController) {}

  public ngOnInit(): void {
    this.subscription = this.dropshipService.checkoutItemsObservable.subscribe(result => {
      this.checkoutItems = result;
    });
  }

  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  public goBack(): void {
    this.navController.push(SelectSpecialsPage);
  }
}
