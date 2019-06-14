import { Component, ViewChild, ElementRef } from '@angular/core';
import { NavParams, ViewController, Content } from 'ionic-angular';
import * as Constants from '../../util/constants';

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
  @ViewChild('immuneElement') private immuneElement: Content;

  constructor(private readonly navParams: NavParams,
              public viewCtrl: ViewController) {


    
    this.data = this.navParams.data;
    if (this.data) {
      this.checkPopoverType();
    }
  }

  ionViewDidLoad(){
    this.immuneElement._elementRef.nativeElement.children[1].classList.add('keyboard-immune');
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
      data.type = this.isMarketOnlyList ? 'market_only' : 'default';
    }


    let navOptions;
    if (this.instantCloseOnNo && option === 'OK') {
      navOptions = { animate: false };
    }

    this.viewCtrl.dismiss(data, undefined , navOptions ? navOptions : undefined).then(() => {
    });
  }

}
