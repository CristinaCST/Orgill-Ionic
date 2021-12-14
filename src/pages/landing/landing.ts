import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavigatorService } from '../../services/navigator/navigator';
import { NavOptions } from 'ionic-angular';
import { CatalogsProvider } from '../../providers/catalogs/catalogs';
import { LoadingService } from '../../services/loading/loading';
import { TranslateWrapperService } from '../../services/translate/translate';
import { ScannerPage } from '../../pages/scanner/scanner';
import { ScannerService } from '../../services/scanner/scanner';
import { Product } from '../../interfaces/models/product';
import { ProductsSearchPage } from '../../pages/products-search/products-search';
import { REGULAR_CATALOG, LANDING_PAGE_TITLE } from '../../util/strings';
import { AllShoppingLists } from '../../pages/all-shopping-lists/all-shopping-lists';
import { PromotionsPage } from '../market-catalog/promotions-page';
import { ShoppingListsProvider } from '../../providers/shopping-lists/shopping-lists';
import { Catalog } from '../catalog/catalog';
import { RouteTrackingPage } from '../../pages/route-tracking/route-tracking';
import { Subject, Subscription } from 'rxjs';
import { throttleTime } from 'rxjs/operators';

@Component({
  selector: 'page-landing',
  templateUrl: 'landing.html'
})
export class LandingPage implements OnInit, OnDestroy {
  private readonly simpleLoader: LoadingService;
  public pageTitle: string = this.translateProvider.translate(LANDING_PAGE_TITLE);
  public copyrightYear: number = new Date().getFullYear();
  private readonly scanClicks: Subject<any> = new Subject();
  private scanSubscription: Subscription;

  constructor(
    public navigatorService: NavigatorService,
    public loadingService: LoadingService,
    public catalogProvider: CatalogsProvider,
    public translateProvider: TranslateWrapperService,
    public shoppingListProvider: ShoppingListsProvider,
    public scannerService: ScannerService
  ) {
    this.simpleLoader = loadingService.createLoader();
  }

  public ngOnInit(): void {
    this.scanSubscription = this.scanClicks.pipe(throttleTime(1000)).subscribe(() => {
      this.scannerService.scan(undefined, undefined);

      this.navigatorService
        .push(ScannerPage, {
          type: 'scan_barcode_tab'
        })
        .catch(err => console.error(err));
    });
  }

  public ngOnDestroy(): void {
    this.scanSubscription.unsubscribe();
  }

  public clickCb(): void {
    this.scanClicks.next();
  }

  public goToPage(page: any): any {
    switch (page) {
      case 'scannerPage':
        this.scannerService.scan(undefined, undefined);
        // TODO: this is a hack and it is present to fix a bug where the app would have runtime errors due to cyclic dependencies
        this.navigatorService
          .push(ScannerPage, {
            type: 'scan_barcode_tab'
          })
          .catch(err => console.error(err));
        break;
      case 'allShoppingLists':
        return this.navigatorService.push(AllShoppingLists).catch(err => console.error(err));
      case 'catalog':
        return this.navigatorService.push(Catalog).catch(err => console.error(err));
      case 'promotions':
        return this.navigatorService.push(PromotionsPage).catch(err => console.error(err));
      case 'routeTracking':
        return this.navigatorService.push(RouteTrackingPage).catch(err => console.error(err));

      default:
        this.navigatorService.push(Catalog).catch(err => console.error(err));
        break;
    }
  }

  private filterBadRequest(data: Product[]): Product[] {
    return data.length === 0 || data[0].CatID === 'Bad Request' ? [] : data;
  }

  public onSearched($event: any): void {
    this.simpleLoader.show();
    this.catalogProvider.search($event, '', '').subscribe(
      data => {
        if (data) {
          const dataFound: Product[] = this.filterBadRequest(JSON.parse(data.d));
          const params: any = {
            searchString: $event,
            searchData: dataFound,
            programNumber: '',
            programName: this.translateProvider.translate(REGULAR_CATALOG).toUpperCase(),
            numberOfProductsFound: dataFound[0] ? dataFound[0].TOTAL_REC_COUNT : 0
          };
          this.navigatorService.push(ProductsSearchPage, params, { paramsEquality: false } as NavOptions).then();
          this.simpleLoader.hide();
        }
      },
      err => {
        LoadingService.hideAll();
      }
    );
  }
}
