import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavParams } from 'ionic-angular';
import { LoadingService } from '../../services/loading/loading';
import { Product } from '../../interfaces/models/product';
import { CatalogsProvider } from '../../providers/catalogs/catalogs';
import { Program } from '../../interfaces/models/program';
import { NavigatorService } from '../../services/navigator/navigator';
import { ScannerService } from '../../services/scanner/scanner';
import { ShoppingList } from '../../interfaces/models/shopping-list';
import { ShoppingListItem } from '../../interfaces/models/shopping-list-item';
import { getNavParam } from '../../helpers/validatedNavParams';
import { ProductPage } from '../../pages/product/product';
import { Subject, Subscription } from 'rxjs';
import { throttleTime } from 'rxjs/operators';


@Component({
  selector: 'page-scanner',
  templateUrl: 'scanner.html'
})
export class ScannerPage implements OnInit, OnDestroy {
  public selectedProduct: any;
  public programNumber: string = '';
  public programs: Program[] = [];
  public isMarketOnly: boolean = false;
  public scanMessage: string = '';
  public searchString: string;
  public foundProduct: Product;
  public shoppingList: ShoppingList;
  public shoppingListId: number;
  public productAlreadyInList: boolean = false;
  public searchTab: any;
  public products: ShoppingListItem[] = [];
  public noProductFound: boolean = false;
  public fromSearch: boolean = false;
  public isZebraDevice: boolean = false;
  private readonly simpleLoader: LoadingService;
  private readonly scanClicks: Subject<any> = new Subject();
  private scanSubscription: Subscription;

  constructor(
    public navigatorService: NavigatorService,
    public navParams: NavParams,
    private readonly loadingService: LoadingService,
    private readonly catalogsProvider: CatalogsProvider,
    private readonly scannerService: ScannerService
  ) {
    this.simpleLoader = this.loadingService.createLoader();
    this.checkDeviceType();
  }

  private checkDeviceType(): void {
    try {
      this.isZebraDevice = (window as any).Android.isRunningOnZebraDevice() || false;
    } catch (error) {
      console.error('Error checking device type:', error);
      this.isZebraDevice = false;
    }
  }

  public ngOnInit(): void {
    this.shoppingList = getNavParam(this.navParams, 'shoppingList', 'object');
    if (this.shoppingList) {
      this.shoppingListId = this.shoppingList.ListID;
      this.scannerService.scan(this.shoppingList, this.products);
      // TODO: What happens here
    }
    this.products = getNavParam(this.navParams, 'products', 'object');
    this.fromSearch = getNavParam(this.navParams, 'fromSearch', 'boolean');
    this.searchTab = getNavParam(this.navParams, 'type');
    this.scanMessage = '';
    this.catalogsProvider.getPrograms().subscribe((resp: any) => {
      const data: Program[] = resp;
      if (data.length > 0) {
        data.forEach(elem => this.programs.push(elem));
      }
    });

    this.scanSubscription = this.scanClicks.pipe(throttleTime(1000)).subscribe(() => {
      this.scannerService.scan(undefined, undefined);
    });
  }

  public ngOnDestroy(): void {
    this.scanSubscription.unsubscribe();
  }

  public clickCb(): void {
    // this.scanClicks.next();
    // this.scannerService.onBarcodeScan("3284601671",false)
    //at first pass undefined
    this.scannerService.scan(undefined, undefined);
    window.ozone.openScanner();
  }

  public onSearched($event: any): void {
    this.simpleLoader.show();
    this.catalogsProvider.search($event, '', this.programNumber).subscribe(
      (data: any) => {
        if (data) {
          this.simpleLoader.hide();
          const params: any = {
            type: this.searchTab,
            shoppingList: this.shoppingList,
            products: data,
            fromSearch: true
          };
          this.navigatorService.push(ScannerPage, params, { paramsEquality: false }).catch(err => console.error(err));
        }
      },
      err => {
        LoadingService.hideAll();
      }
    );
  }

  public goToProductPage(product: Product): void {
    this.navigatorService.push(ProductPage, {
      product,
      programName: '',
      programNumber: '',
      subcategoryName: ''
    });
  }
}
