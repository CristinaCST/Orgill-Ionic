import {Component, Input, OnInit} from '@angular/core';
import {Product} from "../../interfaces/models/product";
import {ProgramProvider} from "../../providers/program/program";
import {ItemProgram} from "../../interfaces/models/item-program";

/**
 * Generated class for the ProductQuantityComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'product-quantity',
  templateUrl: 'product-quantity.html'
})
export class ProductQuantityComponent implements OnInit {
  @Input() product: Product;
  public productPrice: number = 0;
  public total: number = 0;
  public quantity = 1;
  public program: ItemProgram;

  constructor(private programProvider: ProgramProvider) {
  }

  ngOnInit(): void {
    this.programProvider.getSelectedProgram().subscribe(program => {
      if (program) {
        this.program = program;
        this.total = parseInt(this.program.PRICE);
        this.productPrice = parseInt(this.program.PRICE);
      }
    })
  }

  add() {
    this.quantity++;
    this.setTotal();
  }

  remove() {
    if (this.quantity > 1) {
      this.quantity--;
    }
    this.setTotal();
  }

  setTotal() {
    if (this.program) {
      this.total = this.quantity * parseInt(this.program.PRICE);
    }
  }

  quantityChange() {
    if (isNaN(this.quantity)) {
      this.quantity = 1;
    }
  }

}
