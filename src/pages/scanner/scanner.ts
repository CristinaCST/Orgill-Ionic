import {Component} from '@angular/core';
import {IonicPage, LoadingController, NavController, NavParams, Platform} from 'ionic-angular';
import {BarcodeScanner} from "@ionic-native/barcode-scanner";
import {LoadingProvider} from "../../providers/loading/loading";
import {TranslateProvider} from "../../providers/translate/translate";
import * as Constants from '../../util/constants';
import {User} from "../../interfaces/models/user";
import {LocalStorageHelper} from "../../helpers/local-storage-helper";
import {SearchProductRequest} from "../../interfaces/request-body/search-product-request";
import {ScannerProvider} from "../../providers/scanner/scanner";
import {Product} from "../../interfaces/models/product";
import {ProductProvider} from "../../providers/product/product";
import {ProductDetailsPage} from "../product-details/product-details";
import {PopoversProvider} from "../../providers/popovers/popovers";
import {MyApp} from "../../app/app.component";
import {ShoppingListItem} from "../../interfaces/models/shopping-list-item";
import {ProductPage} from "../product/product";


@Component({
  selector: 'page-scanner',
  templateUrl: 'scanner.html',
})
export class ScannerPage {

  selectedProduct: any;
  programNumber: string;
  searchString: string;
  foundProduct: Product;
  shoppingListId: number;


  constructor(public navCtrl: NavController,
              public navParams: NavParams,
              private barcodeScanner: BarcodeScanner,
              private loading: LoadingProvider,
              private translator: TranslateProvider,
              private scannerProvider: ScannerProvider,
              private productProvider: ProductProvider,
              private platform: Platform,
              private popoversProvider: PopoversProvider) {

    this.shoppingListId = this.navParams.get("shoppingListId");
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

  searchProduct() {
    const user: User = JSON.parse(LocalStorageHelper.getFromLocalStorage(Constants.USER));

    const params: SearchProductRequest = {
      'user_token': user.userToken,
      'division': user.division,
      'price_type': user.price_type,
      'search_string': this.searchString,
      'category_id': '-1',
      'program_number': this.programNumber,
      'p': '1',
      'rpp': String(Constants.SEARCH_RESULTS_PER_PAGE),
      'last_modified': ''
    };

    this.scannerProvider.searchProduct(params)
      .subscribe(response => {
          this.loading.hideLoading();
          const responseData = response.d;
          console.log('response', response);

          if (responseData.length > 0) {
            this.foundProduct = responseData[0];
            if (this.shoppingListId) {
              this.navCtrl.push(ProductPage, {
                'product': this.foundProduct,
                'programNumber': this.programNumber,
                'quantity': this.getInitialQuantity(),
                'isAddButtonVisible': true,
                'subCategoryName': ''
              });
            }

            else {
              if (!this.isProductInList(this.shoppingListId)) {
                const newItem: ShoppingListItem = {

                  'product': this.foundProduct,
                  'program_number': '',
                  'quantity': this.getInitialQuantity(),
                  'item_price': Number(this.foundProduct.YOURCOST),
                };

                //TODO: add product to shopping list in DB
              }
            }

          }
          else {
            this.loading.presentLoading(this.translator.translate(Constants.NO_PRODUCTS_FOUND));
            this.scan();
          }
        },
        errorResponse => {
          this.loading.hideLoading();
          if (this.isPermissionError(errorResponse)) {
            let content = {title: Constants.ERROR, message: Constants.POPOVER_CAMERA_PERMISSION_NOT_GRANTED};
            this.popoversProvider.show(content);
          } else {
            let content = {title: Constants.ERROR, message: Constants.SCAN_ERROR};
            this.popoversProvider.show(content);
          }


        });

  }

  private getInitialQuantity(): number {
    if (this.productProvider.isXCategoryProduct(this.foundProduct)) {
      return Number(this.foundProduct.SHELF_PACK);
    }
    return 1;
  }

  protected isProductInList(listId: number): boolean {
    //TODO: check if product in shopping list
    //if()
    return false;
  }

  private isPermissionError(scannerError: string): boolean {

    if (this.platform.is('android')) {
      return scannerError.localeCompare('Illegal access') === 0;
    } else if (this.platform.is('ios')) {
      return scannerError.includes('Access to the camera has been prohibited');
    }

  }


}
