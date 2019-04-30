import {Component, OnInit} from '@angular/core';
import {NavController, NavParams, Platform} from 'ionic-angular';
import {BarcodeScanner} from "@ionic-native/barcode-scanner";
import {LoadingProvider} from "../../providers/loading/loading";
import {TranslateProvider} from "../../providers/translate/translate";
import * as Constants from '../../util/constants';
import {ScannerProvider} from "../../providers/scanner/scanner";
import {Product} from "../../interfaces/models/product";
import {PopoversProvider} from "../../providers/popovers/popovers";
import {ProductPage} from "../product/product";
import {CatalogsProvider} from "../../providers/catalogs/catalogs";
import {ShoppingListsProvider} from "../../providers/shopping-lists/shopping-lists";

@Component({
  selector: 'page-scanner',
  templateUrl: 'scanner.html',
})
export class ScannerPage implements OnInit {

  selectedProduct: any;
  programNumber: string = '';
  searchString: string;
  foundProduct: Product;
  shoppingListId: number;
  public productAlreadyInList: boolean = false;
  public searchTab;
  public products: Array<Product> = [];
  public noProductFound: boolean = false;

  constructor(public navCtrl: NavController,
              public navParams: NavParams,
              private barcodeScanner: BarcodeScanner,
              private loading: LoadingProvider,
              private translator: TranslateProvider,
              private scannerProvider: ScannerProvider,
              private platform: Platform,
              private catalogsProvider: CatalogsProvider,
              private popoversProvider: PopoversProvider,
              private shoppingListProvider: ShoppingListsProvider) {
  }

  ngOnInit(): void {
    this.shoppingListId = this.navParams.get("shoppingListId");
    this.searchTab = this.navParams.get('type');
    this.products = this.navParams.get('products');
  }

  scan() {
    this.selectedProduct = {};
    this.barcodeScanner.scan().then((barcodeData) => {
      const scanResult = barcodeData.text;
      if (this.isValidScanResult(scanResult)) {
        this.loading.presentLoading(this.translator.translate(Constants.SCAN_RESULTS_SEARCHING));
        this.setProgramFromScanResult(scanResult);
        this.setSearchStringFromScanResult(scanResult);
        this.searchProduct();
      }
    });
  }

  private isValidScanResult(scanResult: string): boolean {
    return scanResult.length === 8 || scanResult.length === 10 || scanResult.length >= 12;
  }

  private setProgramFromScanResult(scanResult: string) {
    this.programNumber = scanResult.length === 10 ? scanResult.substring(7, 10) : '';
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
        this.loading.hideLoading();
        const responseData = JSON.parse(response.d);
        if (responseData.length > 0) {
          this.foundProduct = responseData[0];
          if (!this.shoppingListId) {
            this.navCtrl.push(ProductPage, {
              'product': this.foundProduct,
              'programNumber': this.programNumber,
            }).catch(err => console.error(err));
          } else {
            this.isProductInList().then((data) => {
              if (!data) {
                const newItem = {
                  'product': this.foundProduct,
                  'program_number': '',
                  'item_price': Number(this.foundProduct.YOURCOST),
                  'quantity': this.getInitialQuantity()
                };
                this.shoppingListProvider.addItemToShoppingList(this.shoppingListId, newItem).then(
                  data => this.productAlreadyInList = false)
                  .catch(err => console.log(err));
              }
              else {
                this.productAlreadyInList = true;
              }
            });
          }
        }
        else {
          this.noProductFound = true;
          this.scan();
        }
      }, errorResponse => {
        this.loading.hideLoading();
        if (this.isPermissionError(errorResponse)) {
          let content = {title: this.translator.translate(Constants.ERROR), message: this.translator.translate(Constants.POPOVER_CAMERA_PERMISSION_NOT_GRANTED)};
          this.popoversProvider.show(content);
        } else {
          let content = {title: this.translator.translate(Constants.ERROR), message: this.translator.translate(Constants.SCAN_ERROR)};
          this.popoversProvider.show(content);
        }
      });
  }

  private isProductInList() {
    return this.shoppingListProvider.checkProductInList(this.foundProduct.SKU, this.shoppingListId);
  }

  private isPermissionError(scannerError: string): boolean {
    if (this.platform.is('android')) {
      return scannerError.localeCompare('Illegal access') === 0;
    } else if (this.platform.is('ios')) {
      return scannerError.includes('Access to the camera has been prohibited');
    }
  }

  onSearched($event) {
    this.loading.presentSimpleLoading();
    this.catalogsProvider.search($event, '', this.programNumber).subscribe(data => {
      if (data) {
        this.loading.hideLoading();
        let params = {
          type: this.searchTab,
          shoppingListId: this.shoppingListId,
          products: JSON.parse(data.d)
        };
        this.navCtrl.push(ScannerPage, params).catch(err => console.error(err));
      }
    });
  }

  goToProductPage(product: Product) {
    this.navCtrl.push(ProductPage, {
      'product': product,
      'programNumber': this.programNumber
    }).catch(err => console.error(err));
  }
}
