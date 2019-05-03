import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Product} from "../../interfaces/models/product";
import {ProgramProvider} from "../../providers/program/program";
import {ItemProgram} from "../../interfaces/models/item-program";

@Component({
  selector: 'product-quantity',
  templateUrl: 'product-quantity.html'
})
export class ProductQuantityComponent implements OnInit {
  @Input() product: Product;
  @Input() quantityFromList;
  @Output() quantityChange = new EventEmitter<any>();
  public quantity: number = 1;
  public productPrice = 0;
  public total = 0;
  public program: ItemProgram;

  constructor(private programProvider: ProgramProvider) {
  }

  ngOnInit(): void {
    this.programProvider.getSelectedProgram().subscribe(program => {
      if (program) {
        this.program = program;
        if (this.product.QTY_ROUND_OPTION === 'X') {
          this.quantity = this.quantityFromList ? this.quantityFromList : Number(this.product.SHELF_PACK);
        }else{
          this.quantity = this.quantityFromList ? this.quantityFromList : 1
        }
        this.handleQuantityChange();
        this.productPrice = this.getDecimalPrice();
      }
    });

    this.programProvider.isPackQuantity().subscribe(value => {
      if (value === true && this.product) {
        this.quantity = this.quantityFromList ? this.quantityFromList : Number(this.product.SHELF_PACK);
        this.handleQuantityChange();
      }
    });
  }

  getDecimalPrice() {
    return parseFloat(parseFloat(this.program.PRICE).toFixed(2));
  }

  add() {
    if (this.product.QTY_ROUND_OPTION === 'X') {
      this.setPackQuantity('ADD');
    }
    else {
      this.quantity++;
    }
    this.handleQuantityChange();

  }

  remove() {
    if (this.product.QTY_ROUND_OPTION === 'X') {
      if (this.quantity > Number(this.product.SHELF_PACK)) {
        this.setPackQuantity('REMOVE');
      }
    }
    else {
      if (this.quantity > 1) {
        this.quantity--;
      }
    }
    this.handleQuantityChange();
  }

  setTotal() {
    if (this.program) {
      this.total = this.quantity * this.getDecimalPrice();
    }
  }

  setPackQuantity(actionType) {
    let selfPackQuantity = Number(this.product.SHELF_PACK);
    if (this.quantity < selfPackQuantity) {
      this.quantity = selfPackQuantity;
    } else {
      if (this.quantity % selfPackQuantity === 0) {
        switch (actionType) {
          case 'ADD':
            this.quantity = Number(this.quantity) + selfPackQuantity;
            break;
          case 'REMOVE':
            this.quantity = Number(this.quantity) - selfPackQuantity;
            break;
        }
      } else {
        this.quantity = (selfPackQuantity * Math.floor(this.quantity / selfPackQuantity));
      }
    }
  }


  handleQuantityChange() {
    this.setTotal();
    let data = {
      quantity: this.quantity,
      total: this.total,
      productPrice: this.getDecimalPrice()
    };
    this.quantityChange.emit(data);
  }
}
