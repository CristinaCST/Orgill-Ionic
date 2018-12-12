import {Component, OnInit} from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';


@Component({
  selector: 'page-flash-deal-test',
  templateUrl: 'flash-deal-test.html',
})
export class FlashDealTestPage implements OnInit{

  public data;

  constructor(public navCtrl: NavController, public navParams: NavParams) {
  }

  ngOnInit(): void {
    this.data = this.navParams.get("data");
    this.data = this.data.notification.payload.additionalData.SKU;
    console.log(this.data);

  }


}
