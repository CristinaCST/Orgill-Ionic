import {Component} from '@angular/core';
import {NavParams} from "ionic-angular";
import * as Constants from "../../util/constants";
import {ViewController} from "ionic-angular";

@Component({
  selector: 'popover',
  templateUrl: 'popover.html'
})
export class PopoverComponent {
  public data: any = {};
  public listName: string = '';
  public listDescription: string = '';
  public isMarketOnlyList: boolean = false;

  constructor(private navParams: NavParams,
              public viewCtrl: ViewController) {

    this.data = this.navParams.data;
    if (this.data) {
      this.checkPopoverType();
    }
  }

  public checkPopoverType() {
    if (this.data.type) {
      this.data.isNewListAlert = this.data.type == Constants.POPOVER_NEW_SHOPPING_LIST;
      this.data.closeOptionAvailable = this.data.type != Constants.POPOVER_ORDER_CONFIRMATION;
    }
  }

  updateCheck() {
    this.isMarketOnlyList = !this.isMarketOnlyList;
  }

  public dismiss(option) {
    let data: any = {type: this.data.type, optionSelected: option};

    if (this.data.isNewListAlert === true) {
      data.listName = this.listName;
      data.listDescription = this.listDescription;
      data.type = this.isMarketOnlyList === true ? 'market_only' : 'default'
    }
    this.viewCtrl.dismiss(data).then(() => console.log('modal closed'));
  }

}
