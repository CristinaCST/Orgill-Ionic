import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { NavParams } from 'ionic-angular';
import { Product } from '../../interfaces/models/product';
import { ProgramProvider } from '../../providers/program/program';
import { ItemProgram } from '../../interfaces/models/item-program';
import { PopoversService, PopoverContent } from '../../services/popovers/popovers';
import * as Constants from '../../util/constants';
import * as Strings from '../../util/strings';
import { AddToShoppingListPage } from '../add-to-shopping-list/add-to-shopping-list';
import { LoadingService } from '../../services/loading/loading';
import { ShoppingListsProvider } from '../../providers/shopping-lists/shopping-lists';
import { NavigatorService, NavigationEventType } from '../../services/navigator/navigator';
import { CustomerLocationPage } from '../../pages/customer-location/customer-location';
import { HotDealItem } from '../../interfaces/models/hot-deal-item';
import { PricingService } from '../../services/pricing/pricing';
import { HotDealsService } from '../../services/hotdeals/hotdeals';
import { ProductProvider } from '../../providers/product/product';
import { getNavParam } from '../../helpers/validatedNavParams';
import { Events } from 'ionic-angular/util/events';

@Component({
  selector: 'page-product',
  templateUrl: 'product.html'
})
export class ProductPage implements OnInit {
  public product: Product;
  public quantity: number = 1;
  public subCategoryName: string;
  public activeTab: string = 'summary_tab';
  public productPrograms: ItemProgram[] = [];
  public programNumber: string;
  public selectedProgram: ItemProgram;
  public programName: string;
  public isHotDeal: boolean = false;
  public hotDeal: HotDealItem;
  private canLeave: boolean = false;
  private lastEvent: any;

  public fromShoppingList: boolean;
  private shoppingListId: number;
  public quantityFromList: number;
  public regularPrice: number;
  private isAvailable: boolean = true;

  private readonly loader: LoadingService;

  constructor(
    public navigatorService: NavigatorService,
    public navParams: NavParams,
    private readonly loadingService: LoadingService,
    private readonly programProvider: ProgramProvider,
    private readonly popoversService: PopoversService,
    private readonly shoppingListProvider: ShoppingListsProvider,
    private readonly pricingService: PricingService,
    private readonly hotDealsService: HotDealsService,
    private readonly productProvider: ProductProvider,
    private readonly events: Events,
    private readonly changeDetector: ChangeDetectorRef) {

    this.loader = this.loadingService.createLoader();
  }


  public ngOnInit(): void {
    this.events.subscribe(Constants.EVENT_LOADING_FAILED, this.loadingFailedHandler);
    this.initProduct();
  }

  public ngOnDestroy(): void {
    this.events.unsubscribe(Constants.EVENT_LOADING_FAILED, this.loadingFailedHandler);
  }

  private readonly loadingFailedHandler = (culprit?: string): void => {
    if (culprit === 'hot deal program' || !culprit || culprit === 'product program') {
      this.initProduct();
    }
  }

  public initProduct(): void {
    this.loader.show();

    this.product = getNavParam(this.navParams, 'product', 'object');
    this.programNumber = getNavParam(this.navParams, 'programNumber', 'string');
    this.programName = getNavParam(this.navParams, 'programName', 'string');
    this.subCategoryName = getNavParam(this.navParams, 'subcategoryName', 'string');
    this.hotDeal = getNavParam(this.navParams, 'hotDeal', 'object');
    this.isHotDeal = getNavParam(this.navParams, 'isHotDeal', 'boolean');

    this.fromShoppingList = getNavParam(this.navParams, 'fromShoppingList', 'boolean');
    if (this.fromShoppingList) {
      this.shoppingListId = getNavParam(this.navParams, 'shoppingListId', 'number');
      // this.id = getNavParam(this.navParams, id');
      this.quantityFromList = getNavParam(this.navParams, 'quantity', 'number');

      this.changeDetector.detectChanges();
    }

    if (this.isHotDeal) {

      this.hotDealsService.getHotDealProgram(this.product.SKU).subscribe(program => {
        const hotDealProgram: ItemProgram = JSON.parse(program.d);
        const availQty: number = Number(hotDealProgram.AVAILQTY);
        if (!isNaN(availQty) && availQty <= 0) {
          this.isAvailable = false;
        }
        this.regularPrice = Number(hotDealProgram.REGPRICE);

        this.productPrograms = [hotDealProgram];
        if (hotDealProgram.SKU === null) {
          const content: PopoverContent = this.popoversService.setContent(Strings.GENERIC_MODAL_TITLE, Strings.PRODUCT_NOT_AVAILABLE, Strings.MODAL_BUTTON_OK, undefined, undefined, Constants.POPOVER_ERROR);
          this.popoversService.show(content);
          this.navigatorService.pop().catch(err => console.error(err));
          LoadingService.hideAll();
          return;
        }
        const initialProgram: ItemProgram = hotDealProgram;
        this.selectedProgram = initialProgram;
        this.programProvider.selectProgram(initialProgram);
        this.getProduct();

      }, err => {
        //  this.reloadService.paintDirty('hot deal program');
      });

    } else {
      this.programProvider.getProductPrograms(this.product.SKU).subscribe(programs => {
        if (programs) {
          this.productPrograms = JSON.parse(programs.d);
          if (this.productPrograms.length === 0) {
            const content: PopoverContent = this.popoversService.setContent(Strings.GENERIC_MODAL_TITLE, Strings.PRODUCT_NOT_AVAILABLE, Strings.MODAL_BUTTON_OK, undefined, undefined, Constants.POPOVER_ERROR);
            this.popoversService.show(content);
            this.navigatorService.pop().catch(err => console.error(err));
            return;
          }
          const initialProgram: ItemProgram = this.getInitialProgram();
          this.regularPrice = Number(this.productPrograms[0].PRICE);
          this.selectedProgram = initialProgram;
          this.programProvider.selectProgram(initialProgram);
          this.getProduct();
        }
      }, err => {
      //  this.reloadService.paintDirty('product programs');
      });
    }

    this.programProvider.getSelectedProgram().subscribe(selectedProgram => this.selectedProgram = selectedProgram);
  }

  private getInitialProgram(): ItemProgram {
    // let programs = this.productPrograms.filter(program => parseInt(program.PROGRAM_NO) === this.programNumber);
    // return programs.length > 0 ? programs[0] : this.productPrograms[0];
    let initialProgram: ItemProgram;
    const programs: ItemProgram[] = this.productPrograms;
    if (this.programNumber === null) {
      return programs[0];
    }
    programs.forEach(prog => {
      if (prog.PROGRAM_NO === this.programNumber) {
        initialProgram = prog;
      }
    });

    if (initialProgram == undefined) {
      return programs[0];
    }
    return initialProgram;
  }

  public close(): void {
    this.navigatorService.pop().catch(err => console.error(err));
  }


  private getProduct(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.isHotDeal || this.product.MODEL) { // Temp check for a non-vital field to check if a product is passed completely and can be used without further calls.
        LoadingService.hideAll();
        resolve();
      } else {
        this.productProvider.getProduct(this.product.SKU, this.selectedProgram.PROGRAM_NO).subscribe(result => {
          this.product = result;  // Get the new product
          LoadingService.hideAll();
          resolve();
        });
      }
    });
  }


  public addToShoppingList(): void {
    if (this.product.QTY_ROUND_OPTION === 'Y' && this.isMinimum70percentQuantity()) {
      const content: PopoverContent = this.popoversService.setContent(Strings.GENERIC_MODAL_TITLE, Strings.Y_SHELF_PACK_QUANTITY_WARNING, Strings.MODAL_BUTTON_OK, undefined, undefined);
      this.popoversService.show(content);
      this.programProvider.setPackQuantity(true);
    } else if (this.product.QTY_ROUND_OPTION === 'X' && this.quantity % Number(this.product.SHELF_PACK) !== 0) {
      const content: PopoverContent = this.popoversService.setContent(Strings.GENERIC_MODAL_TITLE, Strings.X_SHELF_PACK_QUANTITY_WARNING, Strings.MODAL_BUTTON_OK, undefined, undefined);
      this.popoversService.show(content);
    } else {
      this.navigatorService.push(AddToShoppingListPage, {
        'product': this.product,
        'quantity': this.quantity,
        'selectedProgram': this.selectedProgram
      }).catch(err => console.error(err));
    }
  }

  public buyNow(): void {

    const hotDeal: HotDealItem = {
      ITEM: this.product,
      LOCATIONS: undefined,
      PROGRAM: this.selectedProgram,
      TOTAL_QUANTITY: this.pricingService.validateQuantity(this.quantity, this.selectedProgram, this.product)
    };

    if (!this.isAvailable) {
      const content: PopoverContent = this.popoversService.setContent(Strings.GENERIC_MODAL_TITLE, Strings.SOLD_OUT_MESSAGE);
      this.popoversService.show(content);
      return;
    }

    this.navigatorService.push(CustomerLocationPage, { hotDeal }).catch(err => console.error(err));
  }

  public onQuantityChange($event?: { quantity: number, total?: number }): void {
    if ($event) {
      this.quantity = $event.quantity;
      this.lastEvent = $event;
    }

    this.programProvider.setPackQuantity(false);
  }

  private updateList(silent: boolean = false): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.fromShoppingList && this.lastEvent) {

        if (!silent) {
          this.loader.show();
        }

        this.shoppingListProvider.updateShoppingListItem(this.product, this.shoppingListId, this.programNumber, this.lastEvent.productPrice, this.quantity).subscribe(data => {
          resolve();
        },
          error => {
            LoadingService.hideAll();
            // this.loader.hide();
            console.error('error updating', error);
            // TODO: catch this better
            reject(error);
          });
      }
    });
  }

  public ionViewCanLeave(): boolean {
    if ((this.navigatorService.lastEvent === NavigationEventType.POP) && this.fromShoppingList && !this.canLeave) {
      this.updateList().then(() => {
        this.canLeave = true;
        LoadingService.hideAll();
        // this.loader.hide();
        this.navigatorService.pop();
      }).catch(err => {
        LoadingService.hideAll();
        // this.loader.hide();
        // TODO: catch this better
        /// throw(err);
      });
      return false;
    }
    this.updateList(true);
    return true;
  }

  public isMinimum70percentQuantity(): boolean {
    return this.quantity >= (Number(this.product.SHELF_PACK) * 0.7) && this.quantity < Number(this.product.SHELF_PACK);
  }

}
