import { Component, EventEmitter, Input, Output, AfterViewInit } from '@angular/core';
import { PurchasedItem } from '../../interfaces/models/purchased-item';
import { ProductProvider } from '../../providers/product/product';
import { LoadingService } from '../../services/loading/loading';
import { ProductImageProvider } from '../../providers/product-image/product-image';

@Component({
  selector: 'purchased-item',
  templateUrl: 'purchased-item.html'
})
export class PurchaseItemComponent implements AfterViewInit{
  @Input('purchasedItem') public purchasedItem: PurchasedItem;
  @Output() public goToDetails: EventEmitter<any> = new EventEmitter<any>();
  private readonly loader: LoadingService;
  public imageURL: string = '';
  public imageIsLoading: boolean = true;

  constructor(private readonly productProvider: ProductProvider,
              private readonly loadingService: LoadingService,
              private readonly imageProvider: ProductImageProvider) {
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

  public ngAfterViewInit(): void {
    this.imageProvider.getImageURL(this.purchasedItem.sku).then(data => {
      this.imageURL = data;
      this.imageIsLoading = false;
    });
  }

}
