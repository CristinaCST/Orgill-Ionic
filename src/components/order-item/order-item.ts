import {Component, Input, Output} from '@angular/core';

@Component({
  selector: 'order-item',
  templateUrl: 'order-item.html'
})
export class OrderItemComponent {
  @Input('purchase') purchase;
  @Output() onItemTap;

  constructor() {
  }
}
