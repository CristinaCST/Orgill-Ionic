import { Component } from '@angular/core';
import { NavParams } from 'ionic-angular';
import * as Constants from '../../util/constants';
import { ViewController } from 'ionic-angular';

@Component({
  selector: 'popover',
  templateUrl: 'popover.html'
})
export class PopoverComponent {
  public data: any = {};
  public listName: string = '';
  public listDescription: string = '';
  public isMarketOnlyList: boolean = false;
  private instantCloseOnNo: boolean = false;

  constructor(private navParams: NavParams,
              public viewCtrl: ViewController) {

    this.data = this.navParams.data;
    if (this.data) {
      this.checkPopoverType();
    }
  }

  public checkPopoverType() {
    if (this.data.type) {
      this.data.isNewListAlert = this.data.type === Constants.POPOVER_NEW_SHOPPING_LIST;
      this.data.closeOptionAvailable = this.data.type !== Constants.POPOVER_ORDER_CONFIRMATION;
      this.instantCloseOnNo = this.data.type === Constants.POPOVER_QUIT;
    }
  }

  public updateCheck() {
    this.isMarketOnlyList = !this.isMarketOnlyList;
  }

  public dismiss(option) {
    const data: any = { type: this.data.type, optionSelected: option };

    if (this.data.isNewListAlert === true) {
      data.listName = this.listName;
      data.listDescription = this.listDescription;
      data.type = this.isMarketOnlyList === true ? 'market_only' : 'default';
    }


    let navOptions;
    if (this.instantCloseOnNo && option === 'OK') {
      navOptions = { animate: false };
    }

    this.viewCtrl.dismiss(data, undefined , navOptions ? navOptions : undefined).then(() => {
    });
  }

}
