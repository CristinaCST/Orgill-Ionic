import {Component, EventEmitter, Input, OnInit, Output, ViewChild, ElementRef} from '@angular/core';
import {Product} from "../../interfaces/models/product";
import {ProgramProvider} from "../../providers/program/program";
import {ItemProgram} from "../../interfaces/models/item-program";
import { PricingService } from '../../services/pricing/pricing';

@Component({
  selector: 'product-quantity',
  templateUrl: 'product-quantity.html'
})
export class ProductQuantityComponent implements OnInit {
  @Input() product: Product;
  @Input() quantityFromList;
  @Input() hotDeal: boolean;
  @Output() quantityChange = new EventEmitter<any>();
  public quantity: number = 1;
  public productPrice = 0;
  public total = 0;
  public program: ItemProgram;
  

  constructor(private programProvider: ProgramProvider, private pricingService: PricingService) {
  }

  ngOnInit(): void {
    this.programProvider.getSelectedProgram().subscribe(program => {
      if (program) {
        this.program = program;
       this.quantity = this.validateQuantity(this.quantityFromList);


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
      this.total = this.pricingService.getPrice(this.quantity,this.product);
    }
  }

  setPackQuantity(actionType) {
    let selfPackQuantity = Number(this.product.SHELF_PACK);
    let newQuantity = this.validateQuantity(this.quantity);
    switch (actionType) {
      case 'ADD':
        this.quantity = newQuantity + ((this.product.QTY_ROUND_OPTION === 'X') ? selfPackQuantity : 1);
        break;
      case 'REMOVE':
        this.quantity = newQuantity - ((this.product.QTY_ROUND_OPTION === 'X') ? selfPackQuantity : 1);
        break;
      default:
        this.quantity = newQuantity;
        break;
    }
  }


  handleQuantityChange() {
    this.setPackQuantity("CUSTOM");

    this.setTotal();
    let data = {
      quantity: this.quantity,
      total: this.total,
      productPrice: this.getDecimalPrice()
    };
   // this.quantityChange.emit(data);
  }



  private getMinimumQuantity(){
    return Math.max(1,Number(this.program.MINQTY));
  }

  private validateQuantity(suggestedValue: number){
    if(!suggestedValue){
      return 1;
    }
    console.log(this.program);
    console.log(this.product);
    console.log(suggestedValue);
    return this.pricingService.validateQuantity(suggestedValue,this.program,this.product);
  }
}
