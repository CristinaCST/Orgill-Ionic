import { Component, Input } from '@angular/core';
import { HotDealItem } from '../../interfaces/models/hot-deal-item';

@Component({
  selector: 'hot-deal-product',
  templateUrl: 'hot-deal-product.html'
})
export class HotDealProductComponent {
  @Input('hotDealItem') public hotDealItem: HotDealItem;
  @Input('orderTotal') public orderTotal: number;
}
