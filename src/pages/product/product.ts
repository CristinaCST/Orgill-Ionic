import { Component, OnInit } from '@angular/core';
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
import { HotDealService } from '../../services/hotdeal/hotdeal';
import { ProductProvider } from '../../providers/product/product';
import { getNavParam } from '../../util/validatedNavParams';

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
  public quantityFromList: string;

  private readonly loader: LoadingService;

  constructor(
    public navigatorService: NavigatorService,
    public navParams: NavParams,
    private readonly loadingService: LoadingService,
    private readonly programProvider: ProgramProvider,
    private readonly popoversService: PopoversService,
    private readonly shoppingListProvider: ShoppingListsProvider,
    private readonly pricingService: PricingService,
    private readonly hotDealService: HotDealService,
    private readonly productProvider: ProductProvider) {

    this.loader = this.loadingService.createLoader();
  }

  public ngOnInit(): void {
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
      this.quantityFromList = getNavParam(this.navParams, 'quantity', 'string');
    }

    if (this.isHotDeal) {
      this.hotDealService.getHotDealProgram(this.product.SKU).subscribe(program => {
        const hotDealProgram: ItemProgram = JSON.parse(program.d);
        this.productPrograms = [hotDealProgram];
        if (this.productPrograms.length === 0) {
          const content: PopoverContent = this.popoversService.setContent(Strings.GENERIC_MODAL_TITLE, Strings.PRODUCT_NOT_AVAILABLE, Strings.MODAL_BUTTON_OK, undefined, undefined, Constants.POPOVER_ERROR);
          this.popoversService.show(content);
          this.navigatorService.pop().catch(err => console.error(err));
          return;
        }
        const initialProgram: ItemProgram = hotDealProgram;
        this.selectedProgram = initialProgram;
        this.programProvider.selectProgram(initialProgram);
        this.getProduct().then(() => {
          this.loader.hide();
        });

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
          this.selectedProgram = initialProgram;
          this.programProvider.selectProgram(initialProgram);
          this.getProduct().then(() => {
            this.loader.hide();
          });
        }
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
      this.productProvider.getProduct(this.product.SKU, this.selectedProgram.PROGRAM_NO).subscribe(result => {
        const img: string = this.product.IMAGE;  // Save already processed image by the product component
        this.product = result;  // Get the new product
        this.product.IMAGE = img; // Re-assign already processed image.
        // this.quantity = this.pricingService.validateQuantity(this.quantity,this.selectedProgram,this.product);
        this.loader.hide();
        resolve();
      });
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

    this.navigatorService.push(CustomerLocationPage, { hotDeal }).catch(err => console.error(err));
  }

  public onQuantityChange($event?: { quantity: number, total: number }): void {
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
          console.error('error updating', error);
        });
    }
    });
  }

  public ionViewCanLeave(): boolean {
    if ((this.navigatorService.lastEvent === NavigationEventType.POP) && this.fromShoppingList && !this.canLeave) {
          this.updateList().then(() => {
            this.canLeave = true;
            this.loader.hide();
            this.navigatorService.pop();
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
