import { Injectable } from '@angular/core';
import { CustomerInfoForm } from '../../interfaces/response-body/dropship';
import { BehaviorSubject, Observable } from 'rxjs';
import { AuthService } from '../auth/auth';
import {
  DS_FORM_LIST_TYPE_CA,
  DS_FORM_LIST_TYPE_INT,
  DS_FORM_LIST_TYPE_US,
  USER_TYPE_CAD,
  USER_TYPE_INT,
  USER_TYPE_US
} from '../../util/constants';

@Injectable()
export class DropshipService {
  private readonly checkoutItemsSource: BehaviorSubject<any> = new BehaviorSubject([]);
  private readonly customerInfoFormSource: BehaviorSubject<CustomerInfoForm> = new BehaviorSubject(
    {} as CustomerInfoForm
  );
  private readonly savedOrderDetailsSource: BehaviorSubject<any> = new BehaviorSubject(undefined);
  public checkoutItemsObservable: Observable<any> = this.checkoutItemsSource.asObservable();
  public customerInfoFormObservable: Observable<CustomerInfoForm> = this.customerInfoFormSource.asObservable();
  public savedOrderDetailsObservable: Observable<any> = this.savedOrderDetailsSource.asObservable();

  constructor(private readonly authService: AuthService) {}

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

  public updateSavedOrderDetails(data: any): void {
    this.savedOrderDetailsSource.next(data);
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
}
