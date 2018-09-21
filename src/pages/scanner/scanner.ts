import { Component } from '@angular/core';
import {IonicPage, LoadingController, NavController, NavParams} from 'ionic-angular';
import {BarcodeScanner} from "@ionic-native/barcode-scanner";
import {LoadingProvider} from "../../providers/loading/loading";
import {TranslateProvider} from "../../providers/translate/translate";
import * as Constants from '../../util/constants';
import {User} from "../../interfaces/models/user";
import {LocalStorageHelper} from "../../helpers/local-storage-helper";
import {SearchProductRequest} from "../../interfaces/request-body/search-product-request";
import {ScannerProvider} from "../../providers/scanner/scanner";


@Component({
  selector: 'page-scanner',
  templateUrl: 'scanner.html',
})
export class ScannerPage {

  selectedProduct: any;
  programNumber: string;
  searchString: string;


  constructor(public navCtrl: NavController,
              public navParams: NavParams,
              private barcodeScanner: BarcodeScanner,
              private loading: LoadingProvider,
              private translator: TranslateProvider,
              private scannerProvider: ScannerProvider) {


  }

  scan() {
    this.selectedProduct = {};
    this.barcodeScanner.scan().then((barcodeData) => {
      const scanResult = barcodeData.text;
      console.log("barcodeData", barcodeData.text);
      if (this.isValidScanResult(scanResult)) {
        this.loading.presentLoading(this.translator.translate(Constants.SCAN_RESULTS_SEARCHING));
        this.setProgramFromScanResult(scanResult);
        this.setSearchStringFromScanResult(scanResult);
        this.searchProduct();
      }

    }, (err) => {

    });
  }

  private isValidScanResult(scanResult: string): boolean {
    return scanResult.length === 8 || scanResult.length === 10 || scanResult.length >= 12;
  }

  private setProgramFromScanResult(scanResult: string) {
    this.programNumber = scanResult.length === 10 ? scanResult.substring(7, 10) : '';
  }

  private setSearchStringFromScanResult(scanResult: string) {
    switch (scanResult.length) {
      case 12:
        this.searchString = scanResult.substring(1, scanResult.length);
        break;
      case 10:
      case 8:
        this.searchString = scanResult.substring(0, 7);
        break;
      default:
        this.searchString = scanResult;
    }
  }

  searchProduct(){
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
        'last_modified': '',
      };

      this.scannerProvider.searchProduct(params)
        .subscribe(response => {

          },
          errorResponse => {
          });

    }




}
