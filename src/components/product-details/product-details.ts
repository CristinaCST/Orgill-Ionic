import { AfterViewInit, Component, Input } from '@angular/core';
import { InventoryOnHand, OrderHistory, Product } from '../../interfaces/models/product';
import { ProductDescriptionPage } from '../../pages/product-description/product-description';
import { NavigatorService } from '../../services/navigator/navigator';
import { ProductImageProvider } from '../../providers/product-image/product-image';
import { Modal, ModalController } from 'ionic-angular';
import { ProductPastPurchases } from '../../components/product-past-purchases/product-past-purchases';
import {ProductPage} from "../../pages/product/product";
import {LoadingService} from "../../services/loading/loading";
import {ProductProvider} from "../../providers/product/product";

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
  private readonly loader: LoadingService;


  constructor(
    private readonly navigatorService: NavigatorService,
    private readonly imageProvider: ProductImageProvider,
    private readonly productProvider: ProductProvider,
    public loadingService: LoadingService,
    public modalCtrl: ModalController
  ) {
    this.loader = loadingService.createLoader();
  }


  public showProductDescription(): void {
    this.navigatorService.push(ProductDescriptionPage, { product: this.product }).catch(err => console.error(err));
  }

  public ngAfterViewInit(): void {
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

  public goToProductPage(productSku: string): void {
    this.loader.show();

    this.productProvider.getProduct(productSku, "").subscribe(
      (result) => {
        this.loader.hide();
        if (result) {
          this.navigatorService
            .push(ProductPage, {
              product: result,
              programName: "",
              programNumber: result.program_number,
            })
            .then(() => console.log('%cTo product details page', 'color:pink'))
            .catch(err => console.error('Navigation error:', err));
        }
      },
      (error) => {
        console.error('Error fetching replacement product:', error);
        this.loader.hide()
      }
    );
  }
}
