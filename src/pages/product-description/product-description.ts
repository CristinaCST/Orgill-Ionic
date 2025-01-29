import { AfterViewInit, Component, OnInit } from '@angular/core';
import { NavParams, Events } from 'ionic-angular';
import { Product } from '../../interfaces/models/product';
import { CatalogsProvider } from '../../providers/catalogs/catalogs';
import { LoadingService } from '../../services/loading/loading';
import { getNavParam } from '../../helpers/validatedNavParams';
import * as Constants from '../../util/constants';
import { ProductImageProvider } from '../../providers/product-image/product-image';

@Component({
  selector: 'page-product-description',
  templateUrl: 'product-description.html'
})
export class ProductDescriptionPage implements OnInit, AfterViewInit {
  public description: string = '';
  public discontinuedItem: boolean = false;
  public product: Product;
  public imageURL: string = '';
  public imageIsLoading: boolean = true;
  public loader: LoadingService;

  constructor(
    private readonly navParams: NavParams,
    private readonly catalogProvider: CatalogsProvider,
    public loadingService: LoadingService,
    private readonly events: Events,
    private readonly imageProvider: ProductImageProvider
  ) {
    this.loader = this.loadingService.createLoader();
  }

  public ngOnInit(): void {
    this.events.subscribe(Constants.EVENT_LOADING_FAILED, this.loadingFailedHandler);
    this.initDescription();
  }

  public ngOnDestroy(): void {
    this.events.unsubscribe(Constants.EVENT_LOADING_FAILED, this.loadingFailedHandler);
  }

  private readonly loadingFailedHandler = (culprit?: string): void => {
    if (culprit === 'product description' || !culprit) {
      this.initDescription();
    }
  };

  private initDescription(): void {
    this.product = getNavParam(this.navParams, 'product', 'object');
    this.loader.show();
    this.catalogProvider.getProductDetails(this.product.sku).subscribe(
      (description: any) => {
        this.description = description.description;
        this.discontinuedItem = this.product.discontinueD_REASON_CODE.length > 0;
        this.loader.hide();
      },
      err => {
        // this.reloadService.paintDirty('product description');
      }
    );
  }

  public ngAfterViewInit(): void {
    this.imageProvider.getImageURL(this.product.sku).then(data => {
      this.imageURL = data;
      this.imageIsLoading = false;
    });
  }
}
