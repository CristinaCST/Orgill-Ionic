import {Component, EventEmitter, Input, Output} from '@angular/core';
import * as Constants from '../../util/constants';

@Component({
  selector: 'hot-deal-product',
  templateUrl: 'hot-deal-product.html'
})
export class HotDealProductComponent {
  @Input('hotDealItem') hotDealItem;
  @Input('program') program;
  @Input('totalPrice') totalPrice;

  constructor() {
  }
}
