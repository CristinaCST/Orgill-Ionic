import { AfterViewInit, Component, OnInit } from '@angular/core';
import { NavParams, Events } from 'ionic-angular';
import { Product } from '../../interfaces/models/product';
import { CatalogsProvider } from '../../providers/catalogs/catalogs';
import { LoadingService } from '../../services/loading/loading';
import { getNavParam } from '../../util/validatedNavParams';
import { ReloadService } from '../../services/reload/reload';
import * as Constants from '../../util/constants';

@Component({
  selector: 'page-product-description',
  templateUrl: 'product-description.html'
})
export class ProductDescriptionPage implements OnInit, AfterViewInit {
  public description: string = '';
  public product: Product;
  public imageIsLoading: boolean = true;
  public loader: LoadingService;

  constructor(private readonly navParams: NavParams, private readonly catalogProvider: CatalogsProvider,
              public loadingService: LoadingService, private readonly events: Events, private readonly reloadService: ReloadService) {
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
    this.initDescription();
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
    this.product.IMAGE = this.product.IMAGE === '0000000.jpg' ? '../../assets/imgs/product_placeholder.png' :
      'http://images.orgill.com/200x200/' + this.product.SKU + '.JPG';
  }

  public loadImage(): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img: HTMLImageElement = new Image();
      img.addEventListener('load', () => resolve(img));
      img.onerror = () => {
        reject(new Error('Failed to load URL'));
      };
      img.src = this.product.IMAGE;
    });
  }

  public ngAfterViewInit(): void {
    this.loadImage().then(() => {
      this.imageIsLoading = false;
    }).catch(error => {
      console.error(error);
      this.imageIsLoading = false;
      this.product.IMAGE = '../../assets/imgs/product_placeholder.png';
    });
  }

}
