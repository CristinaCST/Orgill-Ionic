import { Component, Input, OnInit } from '@angular/core';
import * as Strings from '../../util/strings';
import { Purchase } from '../../interfaces/models/purchase';

@Component({
  selector: 'order-item',
  templateUrl: 'order-item.html'
})
export class OrderItemComponent implements OnInit {
  // TODO: Move to constants!!
  private readonly ORDER_METHOD_SEND_TO_ORGILL: number = 1;
  private readonly ORDER_METHOD_CHECKOUT: number = 2;
  public readonly page: boolean = true;

  @Input('purchase') public purchase: Purchase;
  @Input('label') public label: boolean;

  public purchaseType: string = '';

  public ngOnInit(): void {
    if (this.purchase.type === this.ORDER_METHOD_SEND_TO_ORGILL) {
      this.purchaseType = Strings.ORDER_ORGILL;
    } else if (this.purchase.type === this.ORDER_METHOD_CHECKOUT) {
      this.purchaseType = Strings.ORDER_CHECKOUT;
    }
  }
}
