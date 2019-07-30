import { Component, ViewChild, ChangeDetectorRef } from '@angular/core';
import { NavParams, ViewController, Content, NavOptions, TextInput } from 'ionic-angular';
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
  public quantity: number = 1;
  public minqty: number = 1;  // TODO: replace with constaaaaants
  public maxqty: number = 99999;
  public shelfpack: number = 1;  // Don't set shelf pack if quantity round option is not X.
  public supportCode: number;
  private instantCloseOnNo: boolean = false;
  @ViewChild('immuneElement') private readonly immuneElement: Content;
  @ViewChild('listNameInput') private readonly listNameElement: TextInput;

  constructor(private readonly navParams: NavParams,
              public viewCtrl: ViewController,
              private readonly changeDetector: ChangeDetectorRef) {


    this.data = this.navParams.data;
    if (this.data) {
      this.checkPopoverType();
    }
  }

  public ionViewDidLoad(): void {
    this.immuneElement._elementRef.nativeElement.children[1].classList.add('keyboard-immune');
  }

  public checkPopoverType(): void {
    if (this.data.type) {
      this.data.isNewListModal = this.data.type === Constants.POPOVER_NEW_SHOPPING_LIST;
      this.data.closeOptionAvailable = this.data.type !== Constants.POPOVER_ORDER_CONFIRMATION;
      this.data.fillQuantity = this.data.type === Constants.POPOVER_FILL_QUANTITY;
      this.instantCloseOnNo = this.data.type === Constants.POPOVER_QUIT;
      this.data.supportModal = this.data.type === Constants.POPOVER_SUPPORT_HOT_DEAL;
    }

    if (this.data.fillQuantity) {
      if (this.data.additionalData) {
        this.minqty = this.data.additionalData.minqty ? Math.max(this.minqty, this.data.additionalData.minqty) : this.minqty;
        this.quantity = this.minqty;
        this.maxqty = this.data.additionalData.maxqty ? Math.min(this.maxqty, this.data.additionalData.maxqty) : this.maxqty;
        this.shelfpack = this.data.additionalData.shelfpack ? Math.max(this.shelfpack, this.data.additionalData.shelfpack) : this.shelfpack;
      }
    }
  }

  public updateCheck(): void {
    this.isMarketOnlyList = !this.isMarketOnlyList;
  }

  public cleanInput(): void {
    this.listNameElement._elementRef.nativeElement.classList.remove('error-label');
  }

  public dismiss(option: string): void {
    const data: any = { type: this.data.type, optionSelected: option };

    if (this.data.isNewListModal === true) {
      data.listName = this.listName;
      data.listDescription = this.listDescription;
      data.type = this.isMarketOnlyList ? 'market_only' : 'default';

      if (this.listName.replace(' ', '').length < 1 && option === 'OK') {
        this.listNameElement._elementRef.nativeElement.classList.add('error-label');
        return;
      }
    }

    if (this.data.fillQuantity === true) {
      data.quantity = this.quantity;
    }

    if (this.data.supportModal === true) {
      data.code = this.supportCode.toString();
    }

    let navOptions: NavOptions;
    if (this.instantCloseOnNo && option === 'OK') {
      navOptions = { animate: false };
    }
    
    this.viewCtrl.dismiss(data, undefined , navOptions ? navOptions : undefined);
  }

  // TODO: Really refactor all of this...
  public add(): void {
    if (this.quantity + this.shelfpack > this.maxqty && this.maxqty > 0) {
      return;
    }
    this.quantity += this.shelfpack;
    this.changeDetector.detectChanges();
  }

  public substract(): void {
    if (this.quantity - this.shelfpack < this.minqty) {
      return;
    }
    this.quantity -= this.shelfpack;
    this.changeDetector.detectChanges();
  }

  public focusout(): void {
    this.quantity = Math.min(Math.max(this.quantity, this.minqty), this.maxqty > 0 ? this.maxqty : Constants.MAX_QUANTITY_HARDCAP);
  }

}
