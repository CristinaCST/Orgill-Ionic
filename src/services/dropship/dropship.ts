import { Injectable } from '@angular/core';
import { Events } from 'ionic-angular';
import { BarcodeScanner } from '@ionic-native/barcode-scanner';
import { BehaviorSubject, Observable } from 'rxjs';
import { CustomerInfoForm, FormItems, SavedorderList } from '../../interfaces/response-body/dropship';
import { AuthService } from '../auth/auth';
import { DropshipProvider } from '../../providers/dropship/dropship';
import { LoadingService } from '../loading/loading';
import { TranslateWrapperService } from '../translate/translate';
import { PopoverContent, PopoversService } from '../popovers/popovers';
import {
  DS_FORM_LIST_TYPE_CA,
  DS_FORM_LIST_TYPE_INT,
  DS_FORM_LIST_TYPE_US,
  POPOVER_INFO,
  USER_TYPE_CAD,
  USER_TYPE_INT,
  USER_TYPE_US
} from '../../util/constants';
import * as Strings from '../../util/strings';

@Injectable()
export class DropshipService {
  private readonly checkoutItemsSource: BehaviorSubject<any> = new BehaviorSubject([]);
  private readonly savedOrderSource: BehaviorSubject<SavedorderList> = new BehaviorSubject({} as SavedorderList);
  private readonly customerInfoFormSource: BehaviorSubject<CustomerInfoForm> = new BehaviorSubject(
    {} as CustomerInfoForm
  );

  public checkoutItemsObservable: Observable<any> = this.checkoutItemsSource.asObservable();
  public customerInfoFormObservable: Observable<CustomerInfoForm> = this.customerInfoFormSource.asObservable();
  public savedOrderObservable: Observable<SavedorderList> = this.savedOrderSource.asObservable();

  private readonly dropshipLoader: LoadingService;
  public popoverContent: PopoverContent = {
    type: POPOVER_INFO,
    title: Strings.GENERIC_MODAL_TITLE,
    message: Strings.no_results_text,
    positiveButtonText: Strings.MODAL_BUTTON_OK
  };

  constructor(
    public loadingService: LoadingService,
    private readonly events: Events,
    private readonly dropshipProvider: DropshipProvider,
    private readonly authService: AuthService,
    private readonly popoversService: PopoversService,
    private readonly translateProvider: TranslateWrapperService,
    private readonly barcodeScanner: BarcodeScanner
  ) {
    this.dropshipLoader = loadingService.createLoader(this.translateProvider.translate(Strings.loading_text));
  }

  get checkoutItems(): any {
    return this.checkoutItemsSource.getValue();
  }

  get customerInfoForm(): any {
    return this.customerInfoFormSource.getValue();
  }

  public updateCheckoutItems(data: any): void {
    const currentValue: any = this.checkoutItems;

    const intersection: any = currentValue.find(item =>
      'factory_number' in data ? item.factory_number === data.factory_number : item.form_id === data.form_id
    );

    if (!intersection) {
      currentValue.push(data);
    } else {
      currentValue.splice(currentValue.indexOf(intersection), 1);
    }

    this.checkoutItemsSource.next(currentValue);
  }

  public updateItemQuantities(currentItem: any, quantity: number): void {
    const checkoutItems: any = this.checkoutItems.map(item => {
      if (
        'factory_number' in currentItem
          ? currentItem.factory_number === item.factory_number
          : currentItem.form_id === item.form_id
      ) {
        item.selectedQuantity = quantity;
      }

      return item;
    });

    this.checkoutItemsSource.next(checkoutItems);
  }

  public resetCart(data: any = []): void {
    this.checkoutItemsSource.next(data);
  }

  public updateCustomerInfoForm(data: CustomerInfoForm): void {
    this.customerInfoFormSource.next(data);
  }

  public updateSavedOrder(data: SavedorderList): void {
    this.savedOrderSource.next(data);
  }

  public getUserDivision(): string {
    const currentUser: any = this.customerInfoForm.selected_user
      ? this.customerInfoForm.selected_user
      : this.authService.getCurrentUser();

    if (USER_TYPE_INT === currentUser.international) {
      return DS_FORM_LIST_TYPE_INT;
    }

    if (USER_TYPE_US.includes(`${currentUser.division}`)) {
      return DS_FORM_LIST_TYPE_US;
    }

    if (USER_TYPE_CAD.includes(`${currentUser.division}`)) {
      return DS_FORM_LIST_TYPE_CA;
    }
  }

  public searchFormItem(keyword: string, form_id: number, isCheckout?: boolean, isActiveSearch?: boolean): void {
    this.dropshipLoader.show();

    this.dropshipProvider.getFormItemSearch({ keyword, form_id }).subscribe(response => {
      this.dropshipLoader.hide();

      const searchItems: FormItems[] = JSON.parse(response.d);

      if (!Boolean(searchItems.length)) {
        Object.assign(this.popoverContent, { message: Strings.no_results_text });
        this.popoversService.show(this.popoverContent);
        return;
      }

      if (!isActiveSearch && this.checkIfItemIsInCart(searchItems)) {
        Object.assign(this.popoverContent, { message: Strings.item_already_in_cart_text });
        this.popoversService.show(this.popoverContent);
        return;
      }

      this.events.publish(isCheckout ? 'searchItems:checkout' : 'searchItems:shop', searchItems);
    });
  }

  public scanFormItem(form_id: number, isCheckout?: boolean): void {
    this.barcodeScanner.scan({ disableAnimations: true, resultDisplayDuration: 0 }).then(
      data => {
        this.searchFormItem(data.text, form_id, isCheckout);
      },
      error => {
        console.error(error);
        // Object.assign(this.popoverContent, { message: error });
        // this.popoversService.show(this.popoverContent);
      }
    );
  }

  private checkIfItemIsInCart(searchItems: FormItems[]): boolean {
    const items: FormItems[] = this.checkoutItems.filter((checkoutItem: FormItems) =>
      searchItems.map(searchItem => searchItem.factory_number).includes(checkoutItem.factory_number)
    );

    return Boolean(items.length);
  }
}
