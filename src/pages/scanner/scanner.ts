import {Component, OnInit} from '@angular/core';
import {BarcodeScanner} from "@ionic-native/barcode-scanner";
import {NavParams, Platform} from 'ionic-angular';
import {LoadingService} from "../../services/loading/loading";
import {TranslateProvider} from "../../providers/translate/translate";
import * as Constants from '../../util/constants';
import * as Strings from "../../util/strings";
import {ScannerProvider} from "../../providers/scanner/scanner";
import {Product} from "../../interfaces/models/product";
import {PopoversProvider} from "../../providers/popovers/popovers";
import {ProductPage} from "../product/product";
import {CatalogsProvider} from "../../providers/catalogs/catalogs";
import {ShoppingListsProvider} from "../../providers/shopping-lists/shopping-lists";
import {Program} from "../../interfaces/models/program";
import { NavigatorService } from '../../services/navigator/navigator';

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
  private searchingLoader: LoadingService;
  private simpleLoader: LoadingService;

  constructor(public navigatorService: NavigatorService,
              public navParams: NavParams,
              private barcodeScanner: BarcodeScanner,
              private loadingService: LoadingService,
              private translator: TranslateProvider,
              private scannerProvider: ScannerProvider,
              private platform: Platform,
              private catalogsProvider: CatalogsProvider,
              private popoversProvider: PopoversProvider,
              private shoppingListProvider: ShoppingListsProvider) {
                this.searchingLoader = this.loadingService.createLoader(this.translator.translate(Strings.SCAN_RESULTS_SEARCHING));
                this.simpleLoader = this.loadingService.createLoader();
              }

  ngOnInit(): void {
    if (this.navParams.get("shoppingList")) {
      console.log("NAV PARAMS",this.navParams.get("shoppingList"));
      this.shoppingList = this.navParams.get("shoppingList");
      this.shoppingListId = this.shoppingList.ListID;
      this.products = this.navParams.get('products');
      this.scan();
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


  scan() {
    this.selectedProduct = {};
    this.barcodeScanner.scan().then((barcodeData) => {
      const scanResult = barcodeData.text;
      if (this.isValidScanResult(scanResult)) {
    //    console.log("THIS IS THE SCAN RESULT",scanResult);

        this.searchingLoader.show();

        this.setProgramFromScanResult(scanResult);
        this.setSearchStringFromScanResult(scanResult);
        this.searchProduct();
      }else{
        //TODO: check if string is ok
        this.scanMessage = this.translator.translate(Constants.SCAN_INVALID_BARCODE);
      }
    },(err)=>{
      console.error(err);
    });
  }

  isValidScanResult(scanResult: string): boolean {
    return scanResult.length === 8 || scanResult.length === 10 || scanResult.length >= 12;
  }

  private setProgramFromScanResult(scanResult: string) {
    this.programNumber = scanResult.length === 10 ? scanResult.substring(7, 10) : '';
    var filteredPrograms = this.programs.filter(elem => elem.PROGRAMNO == this.programNumber);
    if (filteredPrograms.length > 0) {
      this.isMarketOnly = filteredPrograms[0].MARKETONLY === Constants.MARKET_ONLY_PROGRAM;
    } else{
      this.isMarketOnly = false;
    }
  }

  private setSearchStringFromScanResult(scanResult: string) {
    if (scanResult.length > 12) {
      this.searchString = scanResult.substring(1, scanResult.length);
    } else if (scanResult.length === 10 || scanResult.length === 8) {
      this.searchString = scanResult.substring(0, 7);
    } else {
      this.searchString = scanResult;
    }
  }

  getInitialQuantity() {
    if (this.foundProduct.QTY_ROUND_OPTION === 'X')
      return Number(this.foundProduct.SHELF_PACK);
    else
      return 1;
  }

  searchProduct() {
    this.scannerProvider.searchProduct(this.searchString, this.programNumber)
      .subscribe(response => {
        this.searchingLoader.hide();
        const responseData = JSON.parse(response.d);
        if (responseData.length > 0) {
          this.foundProduct = responseData[0];
          if (!this.shoppingListId) {
            this.navigatorService.push(ProductPage, {
              'product': this.foundProduct,
              'programNumber': this.programNumber,
            }).catch(err => console.error(err));
          } else {

            if (this.isMarketOnly && ((this.shoppingList.ListType.toString() !== Constants.MARKET_ONLY_LIST_TYPE) && (this.shoppingList.ListType.toString() !== Constants.MARKET_ONLY_CUSTOM_TYPE))) {
              this.scanMessage = this.translator.translate(Constants.SCAN_MARKET_ONLY_PRODUCT);
            } else if (this.isMarketOnly === false && ((this.shoppingList.ListType.toString() === Constants.MARKET_ONLY_LIST_TYPE) || (this.shoppingList.ListType.toString() === Constants.MARKET_ONLY_CUSTOM_TYPE))) {
              this.scanMessage = this.translator.translate(Constants.SCAN_REGULAR_PRODUCT);
            } else {
              this.isProductInList().subscribe((resp) => {
                var data = JSON.parse(resp.d).Status === "True";
                if (!data) {
                  const newItem = {
                    'product': this.foundProduct,
                    'program_number': this.programNumber,
                    'item_price': Number(this.foundProduct.YOURCOST),
                    'quantity': this.getInitialQuantity()
                  };
                  this.shoppingListProvider.addItemToShoppingList(this.shoppingList.ListID, newItem, this.shoppingList.isMarketOnly).subscribe(
                    () => {
                      this.productAlreadyInList = false;
                      //TODO: Change to constants_strings
                      this.scanMessage = "Added " + newItem.product.NAME + " to list";
                    });
                }
                else {
                  this.scanMessage = this.translator.translate(Strings.SHOPPING_LIST_EXISTING_PRODUCT);
                  this.productAlreadyInList = true;
                }
              });
            }
          }
        }
        else {
          //TODO: Check string if its fine
          this.scanMessage = this.translator.translate(Constants.SCAN_NOT_FOUND);
          this.noProductFound = true;
          // this.scan();
        }
      }, errorResponse => {
        this.searchingLoader.hide();
        if (this.isPermissionError(errorResponse)) {
          let content = {title: Strings.GENERIC_ERROR, _message: Constants.POPOVER_CAMERA_PERMISSION_NOT_GRANTED,
get message() {
              return this._message;
            },
set message(value) {
              this._message = value;
            },
};
          this.popoversProvider.show(content);
        } else {
          let content = {title: Strings.GENERIC_ERROR, message: Strings.SCAN_ERROR};
          this.popoversProvider.show(content);
        }
      });
  }

  private isProductInList() {
    return this.shoppingListProvider.checkProductInList(this.foundProduct.SKU, this.shoppingListId, this.programNumber);
  }

  private isPermissionError(scannerError: string): boolean {
    if (this.platform.is('android')) {
      return scannerError.localeCompare('Illegal access') === 0;
    } else if (this.platform.is('ios')) {
      return scannerError.includes('Access to the camera has been prohibited');
    }
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

  goToProductPage(product: Product) {
    this.navigatorService.push(ProductPage, {
      'product': product,
      'programNumber': this.programNumber
    }).catch(err => console.error(err));
  }
}
