import { Component, OnInit } from '@angular/core';
import { NavigatorService } from '../../services/navigator/navigator';
import { NavParams, NavOptions, Events } from 'ionic-angular';
import { CatalogsProvider } from '../../providers/catalogs/catalogs';
import { LoadingService } from '../../services/loading/loading';
import { PopoversService } from '../../services/popovers/popovers';
import { TranslateWrapperService } from '../../services/translate/translate';
import { ScannerPage } from '../../pages/scanner/scanner';
import { ScannerService } from '../../services/scanner/scanner';
import { Product } from '../../interfaces/models/product';
import { ProductsSearchPage } from '../../pages/products-search/products-search';
import { REGULAR_CATALOG } from '../../util/strings';
import { AllShoppingLists } from '../../pages/all-shopping-lists/all-shopping-lists';
import { ShoppingListsProvider } from '../../providers/shopping-lists/shopping-lists';
import { LANDING_PAGE_TITLE } from '../../util/strings';

@Component({
  selector: 'page-landing',
  templateUrl: 'landing.html',
})
export class LandingPage {
  private readonly simpleLoader: LoadingService;
  public pageTitle: string = this.translateProvider.translate(LANDING_PAGE_TITLE);

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

  public goToScanPage(): void {
    this.scannerService.scan(undefined, undefined);
    // TODO: this is a hack and it is present to fix a bug where the app would have runtime errors due to cyclic dependencies
    this.navigatorService
      .push(ScannerPage, {
        type: 'scan_barcode_tab',
      })
      .catch((err) => console.error(err));
  }
  public goToShoppingLists(): void {
    this.navigatorService.push(AllShoppingLists).catch((err) => console.error(err));
  }

  private filterBadRequest(data: Product[]): Product[] {
    return data.length === 0 || data[0].CatID === 'Bad Request' ? [] : data;
  }

  public onSearched($event: any): void {
    this.simpleLoader.show();
    this.catalogProvider.search($event, '', '').subscribe(
      (data) => {
        if (data) {
          const dataFound: Product[] = this.filterBadRequest(JSON.parse(data.d));
          const params: any = {
            searchString: $event,
            searchData: dataFound,
            programNumber: '',
            programName: this.translateProvider.translate(REGULAR_CATALOG).toUpperCase(),
            numberOfProductsFound: dataFound[0] ? dataFound[0].TOTAL_REC_COUNT : 0,
          };
          this.navigatorService.push(ProductsSearchPage, params, { paramsEquality: false } as NavOptions).then();
          this.simpleLoader.hide();
        }
      },
      (err) => {
        LoadingService.hideAll();
      }
    );
  }
}
