import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'product',
  templateUrl: 'product.html'
})
export class ProductComponent implements OnInit {

  @Input('product') product;
  productIsLoading: boolean = true;

  constructor() {
  }

  ngOnInit(): void {
  }

}
