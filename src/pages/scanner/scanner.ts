import {Component, OnInit} from '@angular/core';
import {NavParams} from 'ionic-angular';
import {LoadingService} from "../../services/loading/loading";
import {Product} from "../../interfaces/models/product";
import {CatalogsProvider} from "../../providers/catalogs/catalogs";
import {Program} from "../../interfaces/models/program";
import { NavigatorService } from '../../services/navigator/navigator';
import { ScannerService } from '../../services/scanner/scanner';

@Component({
  selector: 'page-scanner',
  templateUrl: 'scanner.html',
})
export class ScannerPage implements OnInit {

  selectedProduct: any;
  programNumber: string = '';
  programs: Array<Program> = [];
  isMarketOnly: boolean = false;
  scanMessage: string = '';
  searchString: string;
  foundProduct: Product;
  shoppingList;
  shoppingListId;
  public productAlreadyInList: boolean = false;
  public searchTab;
  public products: Array<Product> = [];
  public noProductFound: boolean = false;
  private simpleLoader: LoadingService;

  constructor(public navigatorService: NavigatorService,
              public navParams: NavParams,
              private loadingService: LoadingService,
              private catalogsProvider: CatalogsProvider,
              private scannerService: ScannerService) {
                this.simpleLoader = this.loadingService.createLoader();
              }

  ngOnInit(): void {
    if (this.navParams.get("shoppingList")) {
      //console.log("NAV PARAMS",this.navParams.get("shoppingList"));
      this.shoppingList = this.navParams.get("shoppingList");
      this.shoppingListId = this.shoppingList.ListID;
      this.products = this.navParams.get('products')
     // console.log("IS scanner service inited?",this.scannerService);
      this.scannerService.scan(this.shoppingList,this.products);
    }
    this.searchTab = this.navParams.get('type');
    this.scanMessage = "";
    this.catalogsProvider.getPrograms().subscribe(resp => {
      var data = JSON.parse(resp.d);
      if (data.length > 0){
        data.forEach( elem => this.programs.push(elem));
      }
    })
  }

  onSearched($event) {
    this.simpleLoader.show();
    this.catalogsProvider.search($event, '', this.programNumber).subscribe(data => {
      if (data) {
        this.simpleLoader.hide();
        let params = {
          type: this.searchTab,
          shoppingList: this.shoppingList,
          products: JSON.parse(data.d)
        };
        this.navigatorService.push(ScannerPage, params).catch(err => console.error(err));
      }
    });
  }

}
