import { AfterViewInit, Component, OnInit } from '@angular/core';
import { NavParams, Events } from 'ionic-angular';
import { Product } from '../../interfaces/models/product';
import { CatalogsProvider } from '../../providers/catalogs/catalogs';
import { LoadingService } from '../../services/loading/loading';
import { getNavParam } from '../../helpers/validatedNavParams';
import { ReloadService } from '../../services/reload/reload';
import * as Constants from '../../util/constants';
import { ProductImageProvider } from '../../providers/product-image/product-image';

@Component({
  selector: 'page-product-description',
  templateUrl: 'product-description.html'
})
export class ProductDescriptionPage implements OnInit, AfterViewInit {
  public description: string = '';
  public product: Product;
  public imageURL: string = '';
  public imageIsLoading: boolean = true;
  public loader: LoadingService;

  constructor(private readonly navParams: NavParams,
              private readonly catalogProvider: CatalogsProvider,
              public loadingService: LoadingService,
              private readonly events: Events,
              private readonly reloadService: ReloadService,
              private readonly imageProvider: ProductImageProvider) {
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
  }

  private initDescription(): void {
    this.product = getNavParam(this.navParams, 'product', 'object');
    this.loader.show();
    this.catalogProvider.getProductDetails(this.product.SKU).subscribe(description => {
      this.description = JSON.parse(description.d).description;
      this.loader.hide();
    }, err => {
      this.reloadService.paintDirty('product description');
    });
  }

  public ngAfterViewInit(): void {
    this.imageProvider.getImageURL(this.product.SKU).then(data => {
      this.imageURL = data;
      this.imageIsLoading = false;
    });
  }

}
