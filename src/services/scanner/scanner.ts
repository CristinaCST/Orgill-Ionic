import { Injectable } from "@angular/core";
import { NavigatorService } from "../../services/navigator/navigator";
import { BarcodeScanner } from "@ionic-native/barcode-scanner";
import { LoadingService } from "../../services/loading/loading";
import { TranslateProvider } from "../../providers/translate/translate";
import { Product } from "../../interfaces/models/product";
import { Program } from "../../interfaces/models/program";
import * as Constants from "../../util/constants";
import * as Strings from "../../util/strings";
import { ProductProvider } from "../../providers/product/product"
import { ProductPage } from "../../pages/product/product";
import { ShoppingListsProvider } from "../../providers/shopping-lists/shopping-lists";
import { PopoversProvider } from "../../providers/popovers/popovers";
import { Platform, Events} from "ionic-angular";

@Injectable()
export class ScannerService{
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

    constructor(private navigatorService: NavigatorService,
                private barcodeScanner: BarcodeScanner,
                private loadingService: LoadingService,
                private translateProvider: TranslateProvider,
                private productProvider: ProductProvider,
                private shoppingListProvider: ShoppingListsProvider,
                private popoversProvider: PopoversProvider,
                private platform: Platform,
                private events: Events
        ){

    }

    public scan(shoppingList, products) {

      this.navigatorService.oneTimeBackButtonOverride(() => {
        console.log("EXITING SCANNER");
      });

      if(shoppingList){
        this.shoppingList = shoppingList;
        this.shoppingListId = this.shoppingList.ListID;
      }else{
        this.shoppingList = undefined;
        this.shoppingListId = undefined;
      }
        this.products = products;
      
        this.selectedProduct = {};
        this.barcodeScanner.scan({disableAnimations:true,resultDisplayDuration:0}).then((barcodeData) => {

          if (barcodeData == undefined) {
            return;
          }

            const scanResult = barcodeData.text;
            if (this.isValidScanResult(scanResult)) {
              //  this.searchingLoader.show();
                this.setProgramFromScanResult(scanResult);
                this.setSearchStringFromScanResult(scanResult);
                this.searchProduct();
            } else {
                //TODO: check if string is ok
                this.scanMessage = this.translateProvider.translate(Constants.SCAN_INVALID_BARCODE);
            }
        }, (err) => {
            console.error(err);
        });
    }

    private isValidScanResult(scanResult: string): boolean {
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

      searchProduct() {
        this.productProvider.searchProduct(this.searchString, this.programNumber)
          .subscribe(response => {
            let content = {
    
              type: Constants.POPOVER_INFO,
              title: Strings.GENERIC_MODAL_TITLE,
              message: Strings.POPOVER_PLACEHOLDER_MESSAGE,
              positiveButtonText: Strings.MODAL_BUTTON_OK,
          }

            //HACK:Temp
            if(this.searchingLoader)
             { this.searchingLoader.hide();}

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
                  content.message = this.translateProvider.translate(Constants.SCAN_MARKET_ONLY_PRODUCT);
                  this.popoversProvider.show(content);
                } else if (this.isMarketOnly === false && ((this.shoppingList.ListType.toString() === Constants.MARKET_ONLY_LIST_TYPE) || (this.shoppingList.ListType.toString() === Constants.MARKET_ONLY_CUSTOM_TYPE))) {
                  content.message = this.translateProvider.translate(Constants.SCAN_REGULAR_PRODUCT);
                  this.popoversProvider.show(content);
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
                          content.message = "Added " + newItem.product.NAME + " to list";
                          this.events.publish('scannedProductAdded');
                          this.popoversProvider.show(content).subscribe(()=>{
                            
                          });
                          
                        });
                    }
                    else {
                      content.message = this.translateProvider.translate(Strings.SHOPPING_LIST_EXISTING_PRODUCT);
                      this.popoversProvider.show(content);
                      this.productAlreadyInList = true;
                    }
                  });
                }
              }
            }
            else {
              //TODO: Check string if its fine
              content.message = this.translateProvider.translate(Constants.SCAN_NOT_FOUND);
              this.popoversProvider.show(content);
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


      //HACK: This method does not account for MINQTY in a program, 
      getInitialQuantity() {
        if (this.foundProduct.QTY_ROUND_OPTION === 'X')
          return Number(this.foundProduct.SHELF_PACK);
        else
          return 1;
      }
}