import {Component} from '@angular/core';
import {NavParams} from "ionic-angular";
import * as Constants from "../../util/constants";
import {ViewController} from "ionic-angular";
import {TranslateProvider} from "../../providers/translate/translate";

@Component({
  selector: 'popover',
  templateUrl: 'popover.html'
})
export class PopoverComponent {

  listName: string;
  listDescription: string;

  data: any = null;

  constructor(private navParams: NavParams, public viewCtrl: ViewController, private translateProvider: TranslateProvider) {
    this.translateProvider.translate(Constants.SHOPPING_LIST_NEW_DIALOG_HINT_NAME);
    this.translateProvider.translate(Constants.SHOPPING_LIST_NEW_DIALOG_HINT_DESCRIPTION);

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

  public dismiss() {
    let data = {text: 'aa'};
    this.viewCtrl.dismiss(data).then(() => console.log('modal closed'));
  }

}
