import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { NavController } from 'ionic-angular';
import { Observable, Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { AuthService } from '../../services/auth/auth';
import { DropshipService } from '../../services/dropship/dropship';
import { DropshipProvider } from '../../providers/dropship/dropship';
import { User } from '../../interfaces/models/user';
import { CheckoutPage } from '../../pages/ds-checkout/checkout';
import { DefaultPopoverResult, PopoverContent, PopoversService } from '../../services/popovers/popovers';
import { LoadingService } from '../../services/loading/loading';
import * as Constants from '../../util/constants';
import * as Strings from '../../util/strings';
import { TranslateWrapperService } from '../../services/translate/translate';
import { SavedorderList } from '../../interfaces/response-body/dropship';

@Component({
  selector: 'checkout-overlay',
  templateUrl: 'checkout-overlay.html'
})
export class CheckoutOverlayComponent implements OnInit, OnDestroy {
  @Input() public checkoutItems: any;
  @Input() public isCheckout: boolean;
  public requiredMinimum: number;
  public currentUser: User;
  public savedOrder: SavedorderList;
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
    public loadingService: LoadingService,
    private readonly authService: AuthService,
    private readonly navController: NavController,
    private readonly dropshipService: DropshipService,
    private readonly dropshipProvider: DropshipProvider,
    private readonly popoversService: PopoversService,
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

    this.dropshipService.savedOrderObservable.pipe(take(1)).subscribe(savedOrder => {
      this.savedOrder = savedOrder;
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
      let form_order_quantity: string;
      let form_item_list: any = [];

      const item_list: any = this.checkoutItems
        .map(item => {
          const currentQuantity: string = String(
            item.selectedQuantity || item.form_order_quantity || item.order_qty || item.min_qty || 1
          );

          form_id = item.form_id;
          form_order_quantity = currentQuantity;

          if ('item_list' in item) {
            form_item_list = item.item_list.map(currentItem => {
              currentItem.order_quantity = String(currentItem.min_qty || 0);
              return currentItem;
            });
          }

          if ('factory_number' in item) {
            return {
              factory_number: item.factory_number,
              order_quantity: currentQuantity
            };
          }
        })
        .filter(item => item);

      const requestBody: any = {
        ...customerInfo,
        form_id,
        user_name: customerInfo.selected_user && customerInfo.selected_user.user_name,
        form_order_quantity: item_list.length ? 0 : form_order_quantity,
        item_list: item_list.length ? item_list : form_item_list
      };

      const hasSavedOrder: boolean = Boolean(this.savedOrder && Object.keys(this.savedOrder).length);

      if (hasSavedOrder) {
        const [first_name, last_name] = this.savedOrder.full_name.split(' ');
        const { order_id, customer_number, ship_date, po_number } = this.savedOrder;
        Object.assign(requestBody, { order_id, customer_number, ship_date, po_number, first_name, last_name });

        if (sendOrder) {
          this.sendSavedorder(this.savedOrder);
          return;
        }
      }

      (hasSavedOrder
        ? this.dropshipProvider.dsUpdateSavedOrder(requestBody)
        : this.dropshipProvider.dsCreateSavedOrder(requestBody)
      ).subscribe((response: any) => {
        const savedOrderDetails: any = response;

        if (sendOrder) {
          this.sendSavedorder(savedOrderDetails, customerInfo);
        } else {
          this.dropshipLoader.hide();
          this.returnHomePopover(this.popoversService.show(this.popoverContent));
        }

        if (!hasSavedOrder) {
          const currentSavedOrder: any = {
            ...requestBody,
            order_id: savedOrderDetails.order_id || savedOrderDetails[0].order_id,
            full_name: `${requestBody.first_name} ${requestBody.last_name}`
          };
          this.savedOrder = currentSavedOrder;
          this.dropshipService.updateSavedOrder(currentSavedOrder);
        }
      });
    });
  }

  private sendSavedorder(savedOrderDetails: any, customerInfo?: any): void {
    this.dropshipProvider
      .dsSendSavedorder({
        order_id: savedOrderDetails.order_id || savedOrderDetails[0].order_id,
        user_name:
          (customerInfo && customerInfo.selected_user.user_name) ||
          savedOrderDetails.user_name ||
          this.currentUser.user_name,
        customer_email: (customerInfo && customerInfo.email) || savedOrderDetails.email
      })
      .subscribe(() => {
        Object.assign(this.popoverContent, {
          message: Strings.dropship_order_submitted_successfully,
          dismissButtonText: undefined,
          positiveButtonText: Strings.MODAL_BUTTON_OK
        });

        this.dropshipLoader.hide();
        this.returnHomePopover(this.popoversService.show(this.popoverContent));
      });
  }

  private returnHomePopover(observer: Observable<any>): void {
    observer.subscribe((res: DefaultPopoverResult) => {
      if (res.optionSelected === 'OK') {
        Object.assign(this.popoverContent, {
          message: Strings.dropship_return_home,
          dismissButtonText: Strings.MODAL_BUTTON_NO,
          positiveButtonText: Strings.MODAL_BUTTON_YES
        });

        this.popoversService.show(this.popoverContent).subscribe((data: DefaultPopoverResult) => {
          if (data.optionSelected === 'OK') {
            this.navController.popToRoot();
          } else {
            Object.assign(this.popoverContent, {
              message: Strings.dropship_order_saved_successfully,
              dismissButtonText: undefined,
              positiveButtonText: Strings.MODAL_BUTTON_OK
            });
          }
        });
      }
    });
  }

  private calculateRequiredMinimum(checkoutItems: any): void {
    checkoutItems.forEach(item => {
      const special_minimum_order: number = Number(item.special_minimum_order);

      if (Boolean(this.requiredMinimum)) {
        if (Boolean(special_minimum_order) && this.requiredMinimum < special_minimum_order) {
          this.requiredMinimum = special_minimum_order;
        }
      } else if (Boolean(special_minimum_order)) {
        this.requiredMinimum = special_minimum_order;
      }
    });
  }
}
