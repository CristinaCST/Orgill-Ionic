import { Component, EventEmitter, Input, Output } from '@angular/core';
import { PurchasedItem } from '../../interfaces/models/purchased-item';
import { ProductProvider } from '../../providers/product/product';
import { LoadingService } from '../../services/loading/loading';

@Component({
  selector: 'purchased-item',
  templateUrl: 'purchased-item.html'
})
export class PurchaseItemComponent {
  @Input('purchasedItem') public purchasedItem: PurchasedItem;
  @Output() public goToDetails: EventEmitter<any> = new EventEmitter<any>();
  private readonly loader: LoadingService;

  constructor(private readonly productProvider: ProductProvider,
              private readonly loadingService: LoadingService) {
                this.loader = this.loadingService.createLoader();
              }
  
  public clickHandler(): void {
    this.loader.show();
    this.productProvider.getProduct(this.purchasedItem.sku, this.purchasedItem.program_no).subscribe(res => {
      this.goToDetails.emit({ product: res, programNumber: this.purchasedItem.program_no });
    }, err => {
       this.loader.hide();
    });
  }

}
