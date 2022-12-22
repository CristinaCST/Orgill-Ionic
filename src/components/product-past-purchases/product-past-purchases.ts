import { Component, OnInit } from '@angular/core';
import { OrderHistory } from 'interfaces/models/product';
import { NavParams, ViewController } from 'ionic-angular';

@Component({
  selector: 'product-past-purchases',
  templateUrl: 'product-past-purchases.html'
})
export class ProductPastPurchases implements OnInit {
  public orderhistory: OrderHistory[];

  constructor(public navParams: NavParams, public viewCtrl: ViewController) {}

  public ngOnInit(): void {
    this.orderhistory = this.navParams.get('orderhistory');
  }

  public dismiss(): void {
    this.viewCtrl.dismiss();
  }
}
