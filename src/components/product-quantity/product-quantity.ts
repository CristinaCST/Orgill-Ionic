import {Component, EventEmitter, Input, OnInit, Output, ViewChild, ElementRef} from '@angular/core';
import {Product} from "../../interfaces/models/product";
import {ProgramProvider} from "../../providers/program/program";
import {ItemProgram} from "../../interfaces/models/item-program";
import { PricingService } from '../../services/pricing/pricing';
import { max } from 'rxjs/operators';

@Component({
  selector: 'product-quantity',
  templateUrl: 'product-quantity.html'
})
export class ProductQuantityComponent implements OnInit {
  @Input() product: Product;
  @Input() quantityFromList;
  @Input() hotDeal: boolean;
  @Output() quantityChange = new EventEmitter<any>();
  private quantity: number = 1;
  private productPrice = 0;
  private total = 0;
  private program: ItemProgram = {} as ItemProgram;
  private programSubscription;
  private savings: string = "";
  

  constructor(private programProvider: ProgramProvider, private pricingService: PricingService) {
  }

  ngOnInit(): void {
    this.programSubscription = this.programProvider.getSelectedProgram().subscribe(program => {
      if (program) {
        this.program = program;
        this.productPrice = this.getDecimalPrice();
        this.handleQuantityChange();
      }
      
    });
    if (this.quantityFromList) {
      this.quantity = this.validateQuantity(this.quantityFromList);
    }
    //this.quantity = this.validateQuantity(this.quantityFromList);

    /* this.programProvider.isPackQuantity().subscribe(value => {
       if (value === true && this.product) {
         this.quantity = this.quantityFromList ? this.quantityFromList : Number(this.product.SHELF_PACK);
         this.handleQuantityChange();
       }
     });*/
     this.setSavings();
  }

  ngOnDestroy(){
    if (this.programSubscription) {
      this.programSubscription.unsubscribe();
    }
  }

  getDecimalPrice() {
    return parseFloat(parseFloat(this.program.PRICE).toFixed(2));
  }


  //TODO: Make this a bit cleaner...
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
    } else if (this.product.QTY_ROUND_OPTION === 'Y' && this.quantity <= Number(this.product.SHELF_PACK) && this.quantity >= 0.7 * Number(this.product.SHELF_PACK)){
      this.quantity = Math.floor(0.7 * Number(this.product.SHELF_PACK));
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
      this.total = this.pricingService.getPrice(this.quantity,this.product, this.program);
    }
  }

  setPackQuantity(actionType) {
    let selfPackQuantity = Number(this.product.SHELF_PACK);
    let newQuantity = this.validateQuantity(this.quantity);
    switch (actionType) {
      case 'ADD':
        this.quantity = newQuantity  + ((this.product.QTY_ROUND_OPTION === 'X') ? selfPackQuantity : 1);
        break;
      case 'REMOVE':
        this.quantity = newQuantity - ((this.product.QTY_ROUND_OPTION === 'X') ? selfPackQuantity : 1);
        break;
      default:
        this.quantity = newQuantity;
        break;
    }

    this.quantity = this.pricingService.maxCheck(this.quantity);
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

  private setSavings(){
    this.savings = (Math.round(100*(Number(this.product.SUGGESTED_RETAIL) - this.productPrice)/Number(this.product.SUGGESTED_RETAIL))).toString() + "%";
  }

  private getMinimumQuantity(){
    return Math.max(1,Number(this.program.MINQTY));
  }

  ngOnChanges(){
    this.handleQuantityChange();
    this.setSavings();
  }

  private validateQuantity(suggestedValue: number){
    this.setSavings();
    return this.pricingService.validateQuantity(suggestedValue,this.program,this.product);
  }
}
