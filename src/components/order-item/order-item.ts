import {Component, Input, OnInit} from '@angular/core';
import * as Constants from '../../util/constants';

@Component({
  selector: 'order-item',
  templateUrl: 'order-item.html'
})
export class OrderItemComponent implements OnInit {
  private readonly ORDER_METHOD_SEND_TO_ORGILL = 1;
  private readonly ORDER_METHOD_CHECKOUT = 2;

  @Input('purchase') purchase;
  @Input('isButtonDisabled') isButtonDisabled;

  public purchaseType: string = '';

  constructor() {
  }

  ngOnInit(): void {
    if (this.purchase.type === this.ORDER_METHOD_SEND_TO_ORGILL) {
      this.purchaseType = Constants.ORDER_ORGILL;
    } else if (this.purchase.type === this.ORDER_METHOD_CHECKOUT) {
      this.purchaseType = Constants.ORDER_CHECKOUT;
    }
  }
}
