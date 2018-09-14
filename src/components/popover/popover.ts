import {Component} from '@angular/core';
import {NavParams} from "ionic-angular";
import * as Constants from "../../util/constants";
import {ViewController} from "ionic-angular";

@Component({
  selector: 'popover',
  templateUrl: 'popover.html'
})
export class PopoverComponent {
  data: any;
  listName: string;
  listDescription: string;

  constructor(private navParams: NavParams, public viewCtrl: ViewController ) {
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

  public dismiss(option) {
    let data = {type: this.data.type, optionSelected: option};
    this.viewCtrl.dismiss(data).then(() => console.log('modal closed'));
  }

}
