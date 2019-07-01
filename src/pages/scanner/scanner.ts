import { Component, OnInit } from '@angular/core';
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

@Component({
  selector: 'page-scanner',
  templateUrl: 'scanner.html'
})
export class ScannerPage implements OnInit {

  public selectedProduct: any;
  public programNumber: string = '';
  public programs: Program[] = [];
  public isMarketOnly: boolean = false;
  public scanMessage: string = '';
  public searchString: string;
  public foundProduct: Product;
  public shoppingList: ShoppingList;
  public shoppingListId: string;
  public productAlreadyInList: boolean = false;
  public searchTab: any;
  public products: ShoppingListItem[] = [];
  public noProductFound: boolean = false;
  public fromSearch: boolean = false;
  private readonly simpleLoader: LoadingService;

  constructor(public navigatorService: NavigatorService,
              public navParams: NavParams,
              private readonly loadingService: LoadingService,
              private readonly catalogsProvider: CatalogsProvider,
              private readonly scannerService: ScannerService) {
    this.simpleLoader = this.loadingService.createLoader();
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
    this.catalogsProvider.getPrograms().subscribe(resp => {
      const data: Program[] = JSON.parse(resp.d);
      if (data.length > 0) {
        data.forEach(elem => this.programs.push(elem));
      }
    });
  }

  public onSearched($event: any): void {
    this.simpleLoader.show();
    this.catalogsProvider.search($event, '', this.programNumber).subscribe(data => {
      if (data) {
        this.simpleLoader.hide();
        const params: any = {
          type: this.searchTab,
          shoppingList: this.shoppingList,
          products: JSON.parse(data.d),
          fromSearch: true
        };
        this.navigatorService.push(ScannerPage, params).catch(err => console.error(err));
      }
    });
  }

}
