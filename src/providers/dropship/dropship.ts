import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { ApiService } from '../../services/api/api';
import {
  ds_create_savedorder,
  ds_delete_savedorder,
  ds_form_details,
  ds_form_items,
  ds_form_item_search,
  ds_form_list,
  ds_get_savedorder_details,
  ds_get_savedorder_list,
  ds_send_savedorder,
  get_usernames
} from '../../util/constants-url';

/*
  Generated class for the RouteTrackingProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class DropshipProvider {
  constructor(private readonly apiProvider: ApiService) {}

  /* returns an array of saved orders */
  public getSavedorderList(): Observable<{ d: string }> {
    return this.apiProvider.post(ds_get_savedorder_list, {}, true);
  }

  /* returns an array of forms for the vendor */
  public getFormList(body: { formtype: string; type: string }): Observable<{ d: string }> {
    return this.apiProvider.post(ds_form_list, body, true);
  }

  /* returns form details for the vendor form */
  public getFormDetails(body: { form_id: number }): Observable<{ d: string }> {
    return this.apiProvider.post(ds_form_details, body, true);
  }

  /* returns array of form items for the vendor */
  public getFormItems(body: { form_id: number }): Observable<{ d: string }> {
    return this.apiProvider.post(ds_form_items, body, true);
  }

  /* Returns an array of usernames, Names and emails for a customer number */
  public getUsernames(body: { customer_number: string }): Observable<{ d: string }> {
    return this.apiProvider.post(get_usernames, body, true);
  }

  /*
   * Creates a saved order for a vendor login, customer and form
   * returns saved order details
   */
  public dsCreateSavedOrder(body: {
    form_id: string;
    customer_number: string;
    ship_date: string;
    po_number: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    form_order_quantity: number;
    item_list: { factory_number: string; order_quantity: number }[];
  }): Observable<{ d: string }> {
    return this.apiProvider.post(ds_create_savedorder, body, true);
  }

  /*
   * Send a saved order to customer for approval
   * returns (true/false – in case of errors)
   */
  public dsSendSavedorder(body: {
    order_id: number;
    user_name: string;
    customer_email: string;
  }): Observable<{ d: string }> {
    return this.apiProvider.post(ds_send_savedorder, body, true);
  }

  /* returns saved order details */
  public getSavedorderDetails(body: { order_id: number }): Observable<{ d: string }> {
    return this.apiProvider.post(ds_get_savedorder_details, body, true);
  }

  /*
   * Deletes a saved order for a customer and form
   * returns (true/false – in case of errors)
   */
  public dsDeleteSavedorder(body: { order_id: number }): Observable<{ d: string }> {
    return this.apiProvider.post(ds_delete_savedorder, body, true);
  }

  public getFormItemSearch(body: { form_id: number; keyword: string }): Observable<{ d: string }> {
    return this.apiProvider.post(ds_form_item_search, body, true);
  }
}
