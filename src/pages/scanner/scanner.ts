import { Component, OnInit } from '@angular/core';
import { NavParams } from 'ionic-angular';
import { LoadingService } from '../../services/loading/loading';
import { Product } from '../../interfaces/models/product';
import { CatalogsProvider } from '../../providers/catalogs/catalogs';
import { Program } from '../../interfaces/models/program';
import { NavigatorService } from '../../services/navigator/navigator';
import { ScannerService } from '../../services/scanner/scanner';
import { ShoppingList } from 'interfaces/models/shopping-list';

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
  public shoppingListId: number;
  public productAlreadyInList: boolean = false;
  public searchTab: any;
  public products: Product[] = [];
  public noProductFound: boolean = false;
  private simpleLoader: LoadingService;

  constructor(public navigatorService: NavigatorService,
              public navParams: NavParams,
              private loadingService: LoadingService,
              private catalogsProvider: CatalogsProvider,
              private scannerService: ScannerService) {
                this.simpleLoader = this.loadingService.createLoader();
              }

  public ngOnInit(): void {
    if (this.navParams.get('shoppingList')) {
      this.shoppingList = this.navParams.get('shoppingList');
      this.shoppingListId = this.shoppingList.ListID;
      this.products = this.navParams.get('products');
      this.scannerService.scan(this.shoppingList, this.products);
    }
    this.searchTab = this.navParams.get('type');
    this.scanMessage = '';
    this.catalogsProvider.getPrograms().subscribe(resp => {
      const data = JSON.parse(resp.d);
      if (data.length > 0) {
        data.forEach(elem => this.programs.push(elem));
      }
    });
  }

  public onSearched($event) {
    this.simpleLoader.show();
    this.catalogsProvider.search($event, '', this.programNumber).subscribe(data => {
      if (data) {
        this.simpleLoader.hide();
        const params = {
          type: this.searchTab,
          shoppingList: this.shoppingList,
          products: JSON.parse(data.d)
        };
        this.navigatorService.push(ScannerPage, params).catch(err => console.error(err));
      }
    });
  }

}
