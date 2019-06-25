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
  private total: number = 0;
  private program: ItemProgram = {} as ItemProgram;
  private programSubscription: Subscription;
  public savings: string = '';


  constructor(private readonly programProvider: ProgramProvider, private readonly pricingService: PricingService) {}

  public ngOnInit(): void {
    this.programSubscription = this.programProvider.getSelectedProgram().subscribe(program => {
      if (program) {
        this.program = program;
        this.quantity = this.getInitialQuantity();
        this.handleQuantityChange();
      }

    });
    if (this.quantityFromList > 0) {
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

  public ngOnDestroy(): void {
    if (this.programSubscription) {
      this.programSubscription.unsubscribe();
    }
  }

  public getDecimalPrice(): number {
    return parseFloat(parseFloat(this.program.PRICE).toFixed(2));
  }


  // TODO: Make this a bit cleaner...
  public add(): void {
    if (this.product.QTY_ROUND_OPTION === 'X') {
      this.setPackQuantity('ADD');
    } else {
      this.quantity++;
    }
    this.handleQuantityChange();

  }

  public remove(): void {
    if (this.product.QTY_ROUND_OPTION === 'X') {
      if (this.quantity > Number(this.product.SHELF_PACK)) {
        this.setPackQuantity('REMOVE');
      }
    } else if (this.product.QTY_ROUND_OPTION === 'Y' && this.quantity <= Number(this.product.SHELF_PACK) && this.quantity >= Number(this.product.SHELF_PACK) * 0.7) {
      this.quantity = Math.floor(Number(this.product.SHELF_PACK) * 0.7);
    } else {
      if (this.quantity > 1) {
        this.quantity--;
      }
    }
    this.handleQuantityChange();
  }

  public setTotal(): void {
    if (this.program) {
      this.total = this.pricingService.getPrice(this.quantity, this.product, this.program);
    }
  }

  public setPackQuantity(actionType: string): void {
    const selfPackQuantity: number = Number(this.product.SHELF_PACK);
    const newQuantity: number = this.validateQuantity(this.quantity);
    switch (actionType) {
      case 'ADD':
        this.quantity = newQuantity + ((this.product.QTY_ROUND_OPTION === 'X') ? selfPackQuantity : 1);
        break;
      case 'REMOVE':
        this.quantity = newQuantity - ((this.product.QTY_ROUND_OPTION === 'X') ? selfPackQuantity : 1);
        break;
      default:
        this.quantity = newQuantity;
    }

    this.quantity = this.pricingService.maxCheck(this.quantity);
  }


  public handleQuantityChange(): void {
    this.setPackQuantity('CUSTOM');
    this.setTotal();
    this.setSavings();
    const data: { quantity: number, total: number, productPrice: number } = {
      quantity: this.quantity,
      total: this.total,
      productPrice: this.getDecimalPrice()
    };
    this.quantityChange.emit(data);
  }

  private setSavings(): void {
    this.savings = (Math.round((Number(this.product.SUGGESTED_RETAIL) - this.total / this.quantity) * 100 / Number(this.product.SUGGESTED_RETAIL))) + '%';
  }

  public ngOnChanges(): void {
   // this.handleQuantityChange();
  }

  private validateQuantity(suggestedValue: number): number {
    return this.pricingService.validateQuantity(suggestedValue, this.program, this.product);
  }

  private getInitialQuantity(): number {
    return this.pricingService.validateQuantity(1, this.program, this.product, true);
  }
}
