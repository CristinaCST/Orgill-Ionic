import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Product } from '../../interfaces/models/product';
import { ProgramProvider } from '../../providers/program/program';
import { ItemProgram } from '../../interfaces/models/item-program';
import { PricingService } from '../../services/pricing/pricing';
import { Subscription } from 'rxjs';

@Component({
  selector: 'product-quantity',
  templateUrl: 'product-quantity.html'
})
export class ProductQuantityComponent implements OnInit {
  @Input() public product: Product;
  @Input() public quantityFromList: number;
  @Input() public hotDeal: boolean;
  @Output() public quantityChange: EventEmitter<any> = new EventEmitter<any>();
  private quantity: number = 1;
  private productPrice: number = 0;
  private total: number = 0;
  private program: ItemProgram = {} as ItemProgram;
  private programSubscription: Subscription;
  public savings: string = '';


  constructor(private programProvider: ProgramProvider, private pricingService: PricingService) {
  }

  public ngOnInit(): void {
    this.programSubscription = this.programProvider.getSelectedProgram().subscribe(program => {
      if (program) {
        this.program = program;
        this.productPrice = this.getDecimalPrice();
        this.handleQuantityChange();
      }

    });
    if (this.quantityFromList>0) {
      this.quantity = this.validateQuantity(this.quantityFromList);
    }
    // this.quantity = this.validateQuantity(this.quantityFromList);

    /* this.programProvider.isPackQuantity().subscribe(value => {
       if (value === true && this.product) {
         this.quantity = this.quantityFromList ? this.quantityFromList : Number(this.product.SHELF_PACK);
         this.handleQuantityChange();
       }
     });*/
    this.setSavings();
  }

  public ngOnDestroy() {
    if (this.programSubscription) {
      this.programSubscription.unsubscribe();
    }
  }

  public getDecimalPrice() {
    return parseFloat(parseFloat(this.program.PRICE).toFixed(2));
  }


  // TODO: Make this a bit cleaner...
  public add() {
    if (this.product.QTY_ROUND_OPTION === 'X') {
      this.setPackQuantity('ADD');
    } else {
      this.quantity++;
    }
    this.handleQuantityChange();

  }

  public remove() {
    if (this.product.QTY_ROUND_OPTION === 'X') {
      if (this.quantity > Number(this.product.SHELF_PACK)) {
        this.setPackQuantity('REMOVE');
      }
    } else if (this.product.QTY_ROUND_OPTION === 'Y' && this.quantity <= Number(this.product.SHELF_PACK) && this.quantity >= 0.7 * Number(this.product.SHELF_PACK)) {
      this.quantity = Math.floor(0.7 * Number(this.product.SHELF_PACK));
    } else {
      if (this.quantity > 1) {
        this.quantity--;
      }
    }
    this.handleQuantityChange();
  }

  public setTotal() {
    if (this.program) {
      this.total = this.pricingService.getPrice(this.quantity, this.product, this.program);
    }
  }

  public setPackQuantity(actionType) {
    const selfPackQuantity = Number(this.product.SHELF_PACK);
    const newQuantity = this.validateQuantity(this.quantity);
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


  public handleQuantityChange() {
    this.setPackQuantity('CUSTOM');
    this.setTotal();
    const data = {
      quantity: this.quantity,
      total: this.total,
      productPrice: this.getDecimalPrice()
    };
    this.quantityChange.emit(data);
  }

  private setSavings() {
    this.savings = (Math.round(100 * (Number(this.product.SUGGESTED_RETAIL) - this.productPrice) / Number(this.product.SUGGESTED_RETAIL))).toString() + '%';
  }

  public ngOnChanges() {
    this.handleQuantityChange();
    this.setSavings();
  }

  private validateQuantity(suggestedValue: number) {
    this.setSavings();
    return this.pricingService.validateQuantity(suggestedValue, this.program, this.product);
  }
}
