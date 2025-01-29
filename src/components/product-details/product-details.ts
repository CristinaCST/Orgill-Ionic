import { AfterViewInit, Component, Input } from '@angular/core';
import { InventoryOnHand, OrderHistory, Product } from '../../interfaces/models/product';
import { ProductDescriptionPage } from '../../pages/product-description/product-description';
import { NavigatorService } from '../../services/navigator/navigator';
import { ProductImageProvider } from '../../providers/product-image/product-image';
import { Modal, ModalController } from 'ionic-angular';
import { ProductPastPurchases } from '../../components/product-past-purchases/product-past-purchases';

@Component({
  selector: 'product-details',
  templateUrl: 'product-details.html'
})
export class ProductDetailsComponent implements AfterViewInit {
  @Input() public product: Product;
  @Input() public orderhistory: OrderHistory[];
  @Input() public inventoryonhand: InventoryOnHand;
  public imageIsLoading: boolean = true;
  public imageURL: string = '';
  public discontinuedItem: boolean = false;

  constructor(
    private readonly navigatorService: NavigatorService,
    private readonly imageProvider: ProductImageProvider,
    public modalCtrl: ModalController
  ) {}

  public showProductDescription(): void {
    this.navigatorService.push(ProductDescriptionPage, { product: this.product }).catch(err => console.error(err));
  }

  public ngAfterViewInit(): void {
    console.log("product", this.product);
    this.imageProvider.getImageURL(this.product.sku).then(data => {
      this.imageURL = data;
      this.imageIsLoading = false;
      this.discontinuedItem = this.product.discontinueD_REASON_CODE.length > 0;
    });
  }

  public handlePastPurchasesModal(): void {
    const modal: Modal = this.modalCtrl.create(
      ProductPastPurchases,
      { orderhistory: this.orderhistory },
      { cssClass: 'product-past-purchases-modal' }
    );

    modal.present();
  }
}
