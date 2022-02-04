import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { NavController } from 'ionic-angular';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { AuthService } from '../../services/auth/auth';
import { DropshipService } from '../../services/dropship/dropship';
import { DropshipProvider } from '../../providers/dropship/dropship';
import { User } from '../../interfaces/models/user';
import { CheckoutPage } from '../../pages/ds-checkout/checkout';
import { PopoverContent, PopoversService } from '../../services/popovers/popovers';
import { LoadingService } from '../../services/loading/loading';
import * as Constants from '../../util/constants';
import * as Strings from '../../util/strings';
import { TranslateWrapperService } from '../../services/translate/translate';

@Component({
  selector: 'checkout-overlay',
  templateUrl: 'checkout-overlay.html'
})
export class CheckoutOverlayComponent implements OnInit, OnDestroy {
  @Input() public checkoutItems: any;
  @Input() public isCheckout: boolean;
  public requiredMinimum: number;
  public currentUser: User;
  public subscription: Subscription;
  public dsCreateSavedOrderSubscription: Subscription;
  public popoverContent: PopoverContent = {
    type: Constants.POPOVER_INFO,
    title: Strings.GENERIC_MODAL_TITLE,
    message: Strings.dropship_order_saved_successfully,
    positiveButtonText: Strings.MODAL_BUTTON_OK
  };
  private readonly dropshipLoader: LoadingService;

  constructor(
    private readonly authService: AuthService,
    private readonly navController: NavController,
    private readonly dropshipService: DropshipService,
    private readonly dropshipProvider: DropshipProvider,
    private readonly popoversService: PopoversService,
    public loadingService: LoadingService,
    private readonly translateProvider: TranslateWrapperService
  ) {
    this.dropshipLoader = loadingService.createLoader(this.translateProvider.translate(Strings.loading_text));
  }

  get totalCost(): number {
    return this.checkoutItems.reduce(
      (acc, item) =>
        (acc += (item.special_cost || item.total_special_cost) * (item.selectedQuantity || item.min_qty || 1)),
      0
    );
  }

  public ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();

    this.subscription = this.dropshipService.checkoutItemsObservable.subscribe(result => {
      this.checkoutItems = result;

      this.calculateRequiredMinimum(result);
    });
  }

  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  public handleCheckout(): void {
    if (this.totalCost < this.requiredMinimum) {
      return;
    }

    if (this.isCheckout) {
      this.saveDraft(this.isCheckout);
    } else {
      this.navController.push(CheckoutPage);
    }
  }

  public saveDraft(sendOrder?: boolean): void {
    this.dropshipLoader.show();

    this.dropshipService.customerInfoFormObservable.pipe(take(1)).subscribe(customerInfo => {
      let form_id: number;
      let form_order_quantity: number;
      const item_list: any = this.checkoutItems
        .map(item => {
          form_id = item.form_id;
          form_order_quantity = item.selectedQuantity;

          if ('factory_number' in item) {
            return {
              factory_number: item.factory_number,
              order_quantity: item.selectedQuantity
            };
          }
        })
        .filter(item => item);

      const requestBody: any = {
        ...customerInfo,
        form_id,
        form_order_quantity: item_list.length ? 0 : form_order_quantity,
        item_list
      };

      this.dropshipProvider.dsCreateSavedOrder(requestBody).subscribe(response => {
        const savedOrderDetails: any = JSON.parse(response.d);

        if (sendOrder) {
          this.dropshipProvider
            .dsSendSavedorder({
              order_id: savedOrderDetails.order_id,
              user_name: customerInfo.selected_user.user_name || this.currentUser.user_name,
              customer_email: customerInfo.email
            })
            .subscribe(result => {
              console.log(result);
              this.popoverContent.message = Strings.dropship_order_submitted_successfully;
              this.dropshipLoader.hide();
              this.popoversService.show(this.popoverContent);
            });
        } else {
          this.dropshipLoader.hide();
          this.popoversService.show(this.popoverContent);
        }
      });
    });
  }

  private calculateRequiredMinimum(checkoutItems: any): void {
    checkoutItems.forEach(item => {
      if (Boolean(this.requiredMinimum)) {
        if (item.special_minimum_order && this.requiredMinimum < item.special_minimum_order) {
          this.requiredMinimum = item.special_minimum_order;
        }
      } else if (item.special_minimum_order) {
        this.requiredMinimum = item.special_minimum_order;
      }
    });
  }
}
