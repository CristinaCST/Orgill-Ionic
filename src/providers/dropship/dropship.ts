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
  ds_update_savedorder,
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
    return this.apiProvider.get(ds_get_savedorder_list);
  }

  /* returns an array of forms for the vendor */
  public getFormList(body: { formtype: string; type: string }): Observable<{ d: string }> {
    return this.apiProvider.get(ds_form_list, body);
  }

  /* returns form details for the vendor form */
  public getFormDetails(form_id: number): Observable<{ d: string }> {
    return this.apiProvider.get(`${ds_form_details}/${form_id}`);
  }

  /* returns array of form items for the vendor */
  public getFormItems(form_id: number): Observable<{ d: string }> {
    return this.apiProvider.get(`${ds_form_items}/${form_id}`);
  }

  /* Returns an array of usernames, Names and emails for a customer number */
  public getUsernames(customer_number: string): Observable<{ d: string }> {
    return this.apiProvider.get(`${get_usernames}/${customer_number}`);
  }

  /*
   * Creates a saved order for a vendor login, customer and form
   * returns saved order details
   */
  public dsCreateSavedOrder(body: {
    user_name: string;
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
   * Updates a saved order for a customer and form
   * returns saved order details
   */
  public dsUpdateSavedOrder(body: {
    order_id: string;
    form_id: string;
    customer_number: string;
    ship_date: string;
    po_number: string;
    form_order_quantity: number;
    item_list: { factory_number: string; order_quantity: number }[];
  }): Observable<{ d: string }> {
    return this.apiProvider.put(`${ds_update_savedorder}/${body.order_id}`, body);
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
    return this.apiProvider.post(ds_send_savedorder, body);
  }

  /* returns saved order details */
  public getSavedorderDetails(order_id: number): Observable<{ d: string }> {
    return this.apiProvider.get(`${ds_get_savedorder_details}/${order_id}`);
  }

  /*
   * Deletes a saved order for a customer and form
   * returns (true/false – in case of errors)
   */
  public dsDeleteSavedorder(order_id: number): Observable<{ d: string }> {
    return this.apiProvider.delete(`${ds_delete_savedorder}/${order_id}`);
  }

  public getFormItemSearch(body: { form_id: number; keyword: string }): Observable<{ d: string }> {
    return this.apiProvider.get(ds_form_item_search, body);
  }
}
