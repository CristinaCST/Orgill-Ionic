import {Component, Input} from '@angular/core';

@Component({
  selector: 'hot-deal-product',
  templateUrl: 'hot-deal-product.html'
})
export class HotDealProductComponent {
  @Input('hotDealItem') hotDealItem;
  @Input('orderTotal') orderTotal;

  constructor() {
  
  }

}
