import {Component, EventEmitter, Input, OnInit, Output, ViewChild, ElementRef} from '@angular/core';
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
  @ViewChild('quantityInput') quantityInput:ElementRef;
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
   //    this.quantity = this.validateQuantity(this.quantityFromList);


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
    this.quantityChange.emit(data);
  }

  blurInput(){
    this.quantityInput.nativeElement.blur();
  }


  private getMinimumQuantity(){
    return Math.max(1,Number(this.program.MINQTY));
  }

  private validateQuantity(suggestedValue: number){


   // console.warn("MINQTY: "+this.program.MINQTY);
    

    let minQty = this.getMinimumQuantity();
    if(suggestedValue < minQty){
      suggestedValue = minQty;
    }

    if (this.product.QTY_ROUND_OPTION === 'X') {
      let shelfPack = Number(this.product.SHELF_PACK);
        if(suggestedValue > shelfPack)
        {
          if(shelfPack % suggestedValue === 0){
            return suggestedValue;
          }else{
            return shelfPack * Math.ceil(suggestedValue/shelfPack)
          }
        }else
        {
          return shelfPack;
        }
    }else if(this.product.QTY_ROUND_OPTION === 'Y'){
      return (suggestedValue)? suggestedValue : minQty;
    }else{
      return Math.max(1,suggestedValue);
    }
  }
}
