import { Injectable } from '@angular/core';
import { NavigatorService } from '../../services/navigator/navigator';
import { BarcodeScanner } from '@ionic-native/barcode-scanner';
import { LoadingService } from '../../services/loading/loading';
import { TranslateWrapperService } from '../translate/translate';
import { Product } from '../../interfaces/models/product';
import { Program } from '../../interfaces/models/program';
import * as Constants from '../../util/constants';
import * as Strings from '../../util/strings';
import { ProductProvider } from '../../providers/product/product';
import { ProductPage } from '../../pages/product/product';
import { ShoppingListsProvider } from '../../providers/shopping-lists/shopping-lists';
import { PopoversService, PopoverContent } from '../popovers/popovers';
import { Platform, Events } from 'ionic-angular';
import { Observable } from 'rxjs/Observable';
import { ShoppingListItem } from '../../interfaces/models/shopping-list-item';
import { ShoppingList } from '../../interfaces/models/shopping-list';
import { CatalogsProvider } from '../../providers/catalogs/catalogs';

@Injectable()
export class ScannerService {
  public selectedProduct: any;
  public programNumber: string = '';
  //   public programs: Program[] = [];
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
  private readonly searchingLoader: LoadingService;

  constructor(
    private readonly navigatorService: NavigatorService,
    private readonly barcodeScanner: BarcodeScanner,
    private readonly translateProvider: TranslateWrapperService,
    private readonly productProvider: ProductProvider,
    private readonly shoppingListProvider: ShoppingListsProvider,
    private readonly popoversService: PopoversService,
    private readonly platform: Platform,
    private readonly events: Events,
    private readonly loadingService: LoadingService,
    public catalogProvider: CatalogsProvider
  ) {
    this.searchingLoader = this.loadingService.createLoader();
    // this.getPrograms();
  }

  public scan(shoppingList: ShoppingList, products: ShoppingListItem[]): void {
    const buttonOverride: number = this.navigatorService.oneTimeBackButtonOverride(() => {
      // Exiting scanner
    });

    if (shoppingList) {
      this.shoppingList = shoppingList;
      this.shoppingListId = this.shoppingList.ListID;
    } else {
      this.shoppingList = undefined;
      this.shoppingListId = undefined;
    }
    this.products = products;

    this.selectedProduct = {};
    this.barcodeScanner.scan({ disableAnimations: true, resultDisplayDuration: 0 }).then(
      barcodeData => {
        this.navigatorService.removeOverride(buttonOverride);

        if (barcodeData === undefined) {
          return undefined;
        }

        const scanResult: string = barcodeData.text;
        if (this.isValidScanResult(scanResult)) {
          //  this.searchingLoader.show();
          this.setProgramFromScanResult(scanResult);
          this.setSearchStringFromScanResult(scanResult);
          this.searchProduct();
        } else {
          // TODO: check if string is ok
          this.scanMessage = this.translateProvider.translate(Constants.SCAN_INVALID_BARCODE);
        }
      },
      err => {
        console.error(err);
        //   const content: PopoverContent = this.popoversService.setContent(Strings.POPOVER_CAMERA_PERMISSION_TITLE, Strings.POPOVER_CAMERA_PERMISSION_MESSAGE);
        const content: PopoverContent = this.popoversService.setContent('Error message', err);
        this.popoversService.show(content);
      }
    );
  }

  //   public getPrograms(): any {
  //     this.catalogProvider.getPrograms().subscribe(getProgramsResult => {
  //       this.programs = JSON.parse(getProgramsResult.d);
  //     });
  //   }

  private isValidScanResult(scanResult: string): boolean {
    return scanResult.length === 8 || scanResult.length === 10 || scanResult.length >= 12;
  }

  private setProgramFromScanResult(scanResult: string): void {
    this.programNumber = scanResult.length === 10 ? scanResult.substring(7, 10) : '';
    const filteredPrograms: Program[] = this.catalogProvider.programs.filter(
      elem => elem.PROGRAMNO === this.programNumber
    );
    this.isMarketOnly =
      filteredPrograms.length > 0 ? filteredPrograms[0].MARKETONLY === Constants.MARKET_ONLY_PROGRAM : false;
  }

  private setSearchStringFromScanResult(scanResult: string): void {
    if (scanResult.length > 12) {
      this.searchString = scanResult.substring(1, scanResult.length);
    } else if (scanResult.length === 10 || scanResult.length === 8) {
      this.searchString = scanResult.substring(0, 7);
    } else {
      this.searchString = scanResult;
    }
  }

  public searchProduct(): void {
    this.searchingLoader.show();
    this.productProvider.searchProduct(this.searchString, this.programNumber).subscribe(
      response => {
        const content: PopoverContent = {
          type: Constants.POPOVER_INFO,
          title: Strings.GENERIC_MODAL_TITLE,
          message: Strings.POPOVER_PLACEHOLDER_MESSAGE,
          positiveButtonText: Strings.MODAL_BUTTON_OK
        };

        // this.searchingLoader.hide();

        const responseData: Product[] = JSON.parse(response.d);
        if (responseData.length > 0) {
          this.foundProduct = responseData[0];
          if (!this.shoppingListId) {
            this.navigatorService
              .push(ProductPage, {
                product: this.foundProduct,
                programNumber: this.programNumber
              })
              .catch(err => console.error(err));
          } else {
            if (
              this.isMarketOnly &&
              this.shoppingList.ListType !== Constants.MARKET_ONLY_LIST_TYPE &&
              this.shoppingList.ListType !== Constants.CUSTOM_LIST_MARKET_TYPE
            ) {
              content.message = this.translateProvider.translate(Constants.SCAN_MARKET_ONLY_PRODUCT);
              this.searchingLoader.hide();
              this.popoversService.show(content);
            } else if (
              !this.isMarketOnly &&
              (this.shoppingList.ListType === Constants.MARKET_ONLY_LIST_TYPE ||
                this.shoppingList.ListType === Constants.CUSTOM_LIST_MARKET_TYPE)
            ) {
              content.message = this.translateProvider.translate(Constants.SCAN_REGULAR_PRODUCT);
              this.searchingLoader.hide();
              this.popoversService.show(content);
            } else {
              this.isProductInList().subscribe(
                resp => {
                  const data: boolean = JSON.parse(resp.d).Status === 'True'; // TODO: Wtf?
                  if (!data) {
                    const newItem: ShoppingListItem = {
                      product: this.foundProduct,
                      program_number: this.programNumber,
                      item_price: Number(this.foundProduct.YOURCOST),
                      quantity: this.getInitialQuantity()
                    };
                    this.shoppingListProvider
                      .addItemToShoppingList(this.shoppingList.ListID, newItem, this.isMarketOnly)
                      .subscribe(
                        res => {
                          this.productAlreadyInList = false;
                          this.searchingLoader.hide();
                          // TODO: Change to constants_strings
                          content.message = 'Added ' + newItem.product.NAME + ' to list';

                          // WIP
                          // const itemName = newItem.product.NAME;
                          // content.message = Strings.ADDED_ITEM_TO_LIST;
                          this.events.publish(Constants.EVENT_PRODUCT_ADDED_TO_SHOPPING_LIST);
                          this.popoversService.show(content).subscribe(() => {});
                        },
                        err => {
                          this.searchingLoader.hide();
                        }
                      );
                  } else {
                    this.searchingLoader.hide();
                    content.message = this.translateProvider.translate(Strings.SHOPPING_LIST_EXISTING_PRODUCT);
                    this.popoversService.show(content);
                    this.productAlreadyInList = true;
                  }
                },
                err => {
                  this.searchingLoader.hide();
                }
              );
            }
          }
          this.searchingLoader.hide();
        } else {
          this.searchingLoader.hide();
          // TODO: Check string if its fine
          content.message = this.translateProvider.translate(Constants.SCAN_NOT_FOUND);
          this.popoversService.show(content);
          this.noProductFound = true;
          // his.scan();
        }
      },
      errorResponse => {
        this.searchingLoader.hide();
        if (this.isPermissionError(errorResponse)) {
          const content: PopoverContent = {
            title: Strings.GENERIC_ERROR,
            message: Constants.POPOVER_CAMERA_PERMISSION_NOT_GRANTED
          };
          this.popoversService.show(content);
        } else {
          const content: PopoverContent = { title: Strings.GENERIC_ERROR, message: Strings.SCAN_ERROR };
          this.popoversService.show(content);
        }
      }
    );
  }

  private isProductInList(): Observable<any> {
    return this.shoppingListProvider.checkProductInList(this.foundProduct.SKU, this.shoppingListId, this.programNumber);
  }

  private isPermissionError(scannerError: string): boolean {
    if (this.platform.is('android')) {
      return scannerError.localeCompare('Illegal access') === 0;
    }

    if (this.platform.is('ios')) {
      return scannerError.includes('Access to the camera has been prohibited');
    }
  }

  // HACK: This method does not account for MINQTY in a program,
  public getInitialQuantity(): number {
    if (this.foundProduct.QTY_ROUND_OPTION === 'X') {
      return Number(this.foundProduct.SHELF_PACK);
    }
    return 1;
  }
}
